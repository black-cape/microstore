import type { FieldTransform } from './types';

export const json: FieldTransform = {
  serialize(data) {
    return data ? JSON.stringify(data) : null;
  },
  deserialize(data) {
    return data ? JSON.parse(data) : null;
  }
};
