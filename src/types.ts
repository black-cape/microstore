import { CellSchema, Row } from 'tinybase/with-schemas';

export type CallableWithReturn<T> = (data: any) => T;

export type RecordCallableWithReturn<T> = (data: Record<string, any>) => T;

export type RowCallableWithReturn<T> = (data: Row<any, any>) => T;

export type InterpretableWithReturn<T> = (data: Record<string, any>, options: Record<string, any>) => T;

export type InterpreterTypedBatch = {
  data: Record<string, any>[];
  type: string;
};

export type InterpreterReturnValue = {
  data: InterpreterTypedBatch[];
  meta: Record<string, any> | undefined;
};

export type FieldTransform = {
  serialize: CallableWithReturn<any>;
  deserialize: CallableWithReturn<any>;
};

export type RecordTransform = {
  serialize: RecordCallableWithReturn<any>;
  deserialize: RowCallableWithReturn<any>;
};

export type MicroStoreCellSchema = CellSchema & {
  transform?: string;
  primaryKey?: boolean;
};

export type MicrostoreInterpreter = InterpretableWithReturn<InterpreterReturnValue>;

export type ConventionalSchema = Record<string, CellSchema>;

export type ConventionalSchemas = Record<string, ConventionalSchema>;

export type MicroStoreSchema = Record<string, MicroStoreCellSchema>;

export type MicroStoreSchemas = Record<string, MicroStoreSchema>;

export type FieldTransforms = Record<string, FieldTransform>;

export type RecordTransforms = Record<string, RecordTransform>;

export type RawRow = Record<string, any>;

export type RawRecord = Record<any, any>;

export type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;

export type MicroStoreOptions = {
  schemas: MicroStoreSchemas;
  recordTransforms?: RecordTransforms;
  fieldTransforms?: FieldTransforms;
  interpreter?: MicrostoreInterpreter;
};
