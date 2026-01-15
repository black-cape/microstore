// This software is provided to the United States Government (USG) with SBIR Data Rights as defined at Federal Acquisition Regulation 52.227-14, "Rights in Data-SBIR Program" (May 2014) SBIR Rights Notice (Dec 2026) These SBIR data are furnished with SBIR rights under Contract No. H9241522D0001. For a period of 19 years, unless extended in accordance with FAR 27.409(h), after acceptance of all items to be delivered under this contract, the Government will use these data for Government purposes only, and they shall not be disclosed outside the Government (including disclosure for procurement purposes) during such period without permission of the Contractor, except that, subject to the foregoing use and disclosure prohibitions, these data may be disclosed for use by support Contractors. After the protection period, the Government has a paid-up license to use, and to authorize others to use on its behalf, these data for Government purposes, but is relieved of all disclosure prohibitions and assumes no liability for unauthorized use of these data by third parties. This notice shall be affixed to any reproductions of these data, in whole or in part.
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
