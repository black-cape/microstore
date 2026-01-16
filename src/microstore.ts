import { pluralize } from 'ember-inflector';
import { camelCase, omit } from 'lodash-es';
import { createQueries, createStore, type CellSchema, type Queries, type Row, type Store } from 'tinybase';
import { RESTInterpreter } from './interpreter';
import { json } from './transforms';
import type {
  ConventionalSchema,
  ConventionalSchemas,
  FieldTransforms,
  MethodType,
  MicrostoreInterpreter,
  MicroStoreOptions,
  MicroStoreSchema,
  MicroStoreSchemas,
  RawRecord,
  RawRow,
  RecordTransforms
} from './types';

const microStoreReservedKeys = ['transform', 'primaryKey'];
const defaultFieldTransforms = {
  json
};

export class MicroStore {
  schemas: MicroStoreSchemas;
  fieldTransforms: FieldTransforms;
  recordTransforms: RecordTransforms;
  store: Store;
  queries: Queries;
  interpreter: MicrostoreInterpreter;
  private primaryKeys: Record<string, string>;

  constructor(options: MicroStoreOptions) {
    this.primaryKeys = {};
    this.schemas = options.schemas ? options.schemas : {};
    // Thats right, we even support our own field and record level transforms!
    this.fieldTransforms = { ...(options.fieldTransforms ? options.fieldTransforms : {}), ...defaultFieldTransforms };
    this.recordTransforms = options.recordTransforms ? options.recordTransforms : {};
    this.interpreter = options.interpreter ? options.interpreter : RESTInterpreter;
    this.store = createStore();
    this.store.setTablesSchema(this.transformSchemas());
    this.queries = createQueries(this.store);
  }

  private transformSchemas() {
    // we have to remove custom properties or tinybase
    // will ignore our fields.
    const transformedSchemas: ConventionalSchemas = {};
    Object.keys(this.schemas).forEach((k) => {
      transformedSchemas[k] = <ConventionalSchema>{};
      Object.keys(this.schemas[k]).forEach((k2) => {
        transformedSchemas[k][k2] = omit(this.schemas[k][k2], microStoreReservedKeys) as CellSchema;
        const possiblePK: boolean | undefined = this.schemas[k][k2]['primaryKey'];
        if (possiblePK && this.schemas[k][k2]['type'] === 'string') {
          if (this.primaryKeys[k]) {
            throw Error(`More than one primary key defined for schema ${k}`);
          }
          this.primaryKeys[k] = k2;
        }
      });
      // Default PK to id
      if (!this.getPrimaryKey(k) && this.schemas[k]['id'] && this.schemas[k]['id']['type'] === 'string') {
        this.primaryKeys[k] = 'id';
      }
      if (!this.getPrimaryKey(k)) {
        throw Error(
          `No primary key defined for schema ${k}. This schema must have an 'id' field of "type": "string", or another field of "type": "string" with "primaryKey": true.`
        );
      }
    });
    return transformedSchemas;
  }

  getPrimaryKey(type: string) {
    const possiblePK = this.primaryKeys[type];
    return possiblePK ? possiblePK : undefined;
  }

  getSchema(type: string) {
    if (type) {
      if (Object.hasOwn(this.schemas, type)) {
        return this.schemas[type];
      }
    }
    return null;
  }

  getRecordTransform(type: string | undefined) {
    if (type) {
      return this.recordTransforms[type] ? this.recordTransforms[type] : undefined;
    }
    return undefined;
  }

  getFieldTransform(type: string | undefined) {
    if (type) {
      return this.fieldTransforms[type] ? this.fieldTransforms[type] : undefined;
    }
    return undefined;
  }

  serialize(row: RawRow, schema: MicroStoreSchema) {
    const serializedRow: RawRow = {};
    Object.keys(row).forEach((k) => {
      const field = schema[k];
      if (field) {
        const transform = this.getFieldTransform(field.transform);
        serializedRow[k] = transform ? transform.serialize(row[k]) : row[k];
      }
    });
    return serializedRow;
  }

  deserialize(row: Row, schema: MicroStoreSchema) {
    const deserializedRow: RawRow = {};
    Object.keys(row).forEach((k) => {
      const field = schema[k];
      if (field) {
        const transform =
          field.transform && this.fieldTransforms[field.transform] ? this.fieldTransforms[field.transform] : undefined;
        deserializedRow[k] = transform ? transform.deserialize(row[k]) : row[k];
      }
    });
    return deserializedRow;
  }

  // pushRecord is a sugar method to take a single record and push it into the store using whatever verb was used
  pushRecord(type: string, data: RawRecord, method: MethodType, options: Record<string, any> = {}) {
    return this.pushRecords(type, [data], method, options);
  }

  // pushRecords handles an incoming data ("row"s) that are in application level format (with dates, blobs, or other complex types that can't be POJO'd)
  pushRecords(type: string, data: RawRecord[], method: MethodType, options: Record<string, any> = {}) {
    const transform = this.getRecordTransform(type);
    const typeKey = camelCase(pluralize(type));
    if (!transform) {
      return this.pushPayload(method, { [typeKey]: data }, options);
    }
    const rawData = data.map((item) => {
      return transform.serialize(item);
    });
    return this.pushPayload(method, { [typeKey]: rawData }, options);
  }

  // pushPayload handles incoming data (many "row"s) that are in POJO format
  pushPayload(method: MethodType, data: any, options: Record<string, any> = {}) {
    try {
      const batchedPayload = this.interpreter(data, options);
      batchedPayload.data.forEach((payload) => {
        const schema = this.getSchema(payload.type);
        // Only process typed batches that match a defined data schema
        if (schema) {
          const pk = this.getPrimaryKey(payload.type) || 'id';
          if (method === 'DELETE') {
            payload.data.forEach((row) => {
              this.store.delRow(payload.type, row[pk]);
            });
          } else if (method === 'PATCH') {
            payload.data.forEach((row) => {
              // Only try a partial row update if a row already exists
              if (this.store.getRow(payload.type, row[pk])) {
                this.store.setPartialRow(payload.type, row[pk], this.serialize(row, schema));
              } else {
                this.store.setRow(payload.type, row[pk], this.serialize(row, schema));
              }
            });
          } else {
            payload.data.forEach((row) => {
              this.store.setRow(payload.type, row[pk], this.serialize(row, schema));
            });
          }
        }
      });
      return batchedPayload;
    } catch (e) {
      console.warn(e);
    }
  }

  peekRecord<T>(type: string, id: string) {
    const schema = this.getSchema(type);
    const pk = this.getPrimaryKey(type);
    const transformer = this.getRecordTransform(type);
    const effectiveTransformer = transformer ? transformer.deserialize : (x: any) => x;
    if (schema && pk) {
      const row = this.getStore().getRow(type, id);
      if (Object.keys(row).length) {
        return effectiveTransformer(this.deserialize(row, schema)) as T;
      }
    }
    return undefined;
  }

  peekAll<T>(type: string) {
    const schema = this.getSchema(type);
    const pk = this.getPrimaryKey(type);
    const transformer = this.getRecordTransform(type);
    const effectiveTransformer = transformer ? transformer.deserialize : (x: any) => x;
    if (schema && pk) {
      const table = this.getStore().getTable(type);
      return Object.entries(table).map(([_, row]) => {
        const thing = effectiveTransformer(this.deserialize(row, schema));
        return thing as T;
      });
    }
    return [] as T[];
  }

  unloadRecord<T>(type: string, id: string) {
    const record = this.peekRecord<T>(type, id);
    if (record) {
      this.getStore().delRow(type, id);
    }
    return record;
  }

  unloadAll(type: string) {
    if (this.getSchema(type)) {
      this.getStore().delTable(type);
    }
  }

  reset() {
    Object.entries(this.schemas).forEach(([schemaName, _]) => {
      this.unloadAll(schemaName);
    });
  }

  // Need to get the raw tinybase store? use this method
  getStore() {
    return this.store;
  }

  // Need to get the raw tinybase query views? use this method
  getQueries() {
    return this.queries;
  }
}
