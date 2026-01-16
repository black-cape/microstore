import { singularize } from 'ember-inflector';
import { camelCase, isArray } from 'lodash-es';
import type { InterpreterReturnValue } from './types';

export function RESTInterpreter(data: Record<string, any>, _options: Record<string, any>) {
  const typedPayload: InterpreterReturnValue = {
    data: [],
    meta: undefined
  };
  let meta: Record<string, any> | undefined = undefined;

  if (data !== undefined) {
    Object.keys(data).forEach((k) => {
      const content = data[k];
      if (k !== 'meta') {
        const typedData: Record<string, any>[] = [];
        const typeName = camelCase(singularize(k));
        if (isArray(content)) {
          content.forEach((item: any) => {
            typedData.push(item);
          });
        } else {
          typedData.push(content);
        }
        typedPayload.data.push({
          data: typedData,
          type: typeName
        });
      } else {
        meta = data[k];
      }
    });
  }
  typedPayload.meta = meta;
  return typedPayload;
}
