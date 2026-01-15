import { CellSchema, Row } from 'tinybase/with-schemas';
import { Store, Queries, Row as Row$1 } from 'tinybase';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

type CallableWithReturn<T> = (data: any) => T;
type RecordCallableWithReturn<T> = (data: Record<string, any>) => T;
type RowCallableWithReturn<T> = (data: Row<any, any>) => T;
type InterpretableWithReturn<T> = (data: Record<string, any>, options: Record<string, any>) => T;
type InterpreterTypedBatch = {
    data: Record<string, any>[];
    type: string;
};
type InterpreterReturnValue = {
    data: InterpreterTypedBatch[];
    meta: Record<string, any> | undefined;
};
type FieldTransform = {
    serialize: CallableWithReturn<any>;
    deserialize: CallableWithReturn<any>;
};
type RecordTransform = {
    serialize: RecordCallableWithReturn<any>;
    deserialize: RowCallableWithReturn<any>;
};
type MicroStoreCellSchema = CellSchema & {
    transform?: string;
    primaryKey?: boolean;
};
type MicrostoreInterpreter = InterpretableWithReturn<InterpreterReturnValue>;
type ConventionalSchema = Record<string, CellSchema>;
type ConventionalSchemas = Record<string, ConventionalSchema>;
type MicroStoreSchema = Record<string, MicroStoreCellSchema>;
type MicroStoreSchemas = Record<string, MicroStoreSchema>;
type FieldTransforms = Record<string, FieldTransform>;
type RecordTransforms = Record<string, RecordTransform>;
type RawRow = Record<string, any>;
type RawRecord = Record<any, any>;
type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
type MicroStoreOptions = {
    schemas: MicroStoreSchemas;
    recordTransforms?: RecordTransforms;
    fieldTransforms?: FieldTransforms;
    interpreter?: MicrostoreInterpreter;
};

declare function RESTInterpreter(data: Record<string, any>, _options: Record<string, any>): InterpreterReturnValue;

declare class MicroStore {
    schemas: MicroStoreSchemas;
    fieldTransforms: FieldTransforms;
    recordTransforms: RecordTransforms;
    store: Store;
    queries: Queries;
    interpreter: MicrostoreInterpreter;
    private primaryKeys;
    constructor(options: MicroStoreOptions);
    private transformSchemas;
    getPrimaryKey(type: string): string | undefined;
    getSchema(type: string): MicroStoreSchema | null;
    getRecordTransform(type: string | undefined): RecordTransform | undefined;
    getFieldTransform(type: string | undefined): FieldTransform | undefined;
    serialize(row: RawRow, schema: MicroStoreSchema): RawRow;
    deserialize(row: Row$1, schema: MicroStoreSchema): RawRow;
    pushRecord(type: string, data: RawRecord, method: MethodType, options?: Record<string, any>): InterpreterReturnValue | undefined;
    pushRecords(type: string, data: RawRecord[], method: MethodType, options?: Record<string, any>): InterpreterReturnValue | undefined;
    pushPayload(method: MethodType, data: any, options?: Record<string, any>): InterpreterReturnValue | undefined;
    peekRecord<T>(type: string, id: string): T | undefined;
    peekAll<T>(type: string): T[];
    unloadRecord<T>(type: string, id: string): T | undefined;
    unloadAll(type: string): void;
    reset(): void;
    getStore(): Store;
    getQueries(): Queries;
}

declare function useMicroStore(): MicroStore | null;
type WithExistingStore = {
    store: MicroStore;
    children: ReactNode;
};
declare function MicroStoreProvider(props: WithExistingStore): react_jsx_runtime.JSX.Element;

declare function useReactive<T>(type: string, data: T[]): T[];

declare const json: FieldTransform;

export { type CallableWithReturn, type ConventionalSchema, type ConventionalSchemas, type FieldTransform, type FieldTransforms, type InterpretableWithReturn, type InterpreterReturnValue, type InterpreterTypedBatch, type MethodType, MicroStore, type MicroStoreCellSchema, type MicroStoreOptions, MicroStoreProvider, type MicroStoreSchema, type MicroStoreSchemas, type MicrostoreInterpreter, RESTInterpreter, type RawRecord, type RawRow, type RecordCallableWithReturn, type RecordTransform, type RecordTransforms, type RowCallableWithReturn, json, useMicroStore, useReactive };
