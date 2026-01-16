import { useEffect, useRef, useState } from 'react';
import { type Queries } from 'tinybase';
import { useQueries, useResultTable } from 'tinybase/ui-react';
import { useMicroStore } from './provider';
import type { MicroStoreSchema } from './types';

function generateFilter(data: any[] | undefined, pk: string) {
  return new Set(
    data
      ? data.map((obj) => {
          if (typeof obj === 'string') {
            return obj;
          }
          return obj[pk];
        })
      : []
  );
}

function resetQueryDefinition(
  type: string,
  schema: MicroStoreSchema,
  pk: string,
  queryName: string,
  queries: Queries,
  filter: Set<string>
) {
  // So what exactly does this do? It returns all the same tinybase rows that are
  // returned by the same React query being referenced by this reactive wrapper!!
  // That way, when the rows from useResultTable change due to some localized store
  // update through the MicroStore engine, we see those changes reflected without
  // additional server traffic!
  queries.setQueryDefinition(queryName, type, ({ select, where }) => {
    Object.keys(schema).forEach((k) => {
      select(k);
    });
    where((getCell) => filter.has(<string>getCell(pk)));
  });
}

// Wrap the objects in tinybase rows to make them react at a record level
// to individual record changes
export function useReactive<T>(type: string, data: T[] | string[]): T[] {
  const store = useMicroStore();
  const schema = store?.getSchema(type);
  const pk = store?.getPrimaryKey(type);
  if (!schema || !pk) {
    throw new Error(`No MicroStore schema defined for type ${type}`);
  }
  const [uniqueHookID, _] = useState(crypto.randomUUID());
  const queries = useQueries();
  const rows = useResultTable(uniqueHookID, queries);
  const [lastFilter, setLastFilter] = useState('');
  // Air Brake prevents render loops if a user does something very silly like chasing
  // records in a circle
  const airBrake = useRef('');

  // Why is this effect important? Because you ONLY want to update the thing
  // that is bubbling out new rows (the query) if the supporting REST request
  // with its own internal IDs has changed. We
  useEffect(() => {
    if (queries) {
      const filter = generateFilter(data, pk);
      const stringifiedFilter = JSON.stringify([...filter]);
      if (lastFilter !== stringifiedFilter && airBrake.current !== stringifiedFilter) {
        if (Object.entries(rows).length > 0) {
          airBrake.current = stringifiedFilter;
        }
        setLastFilter(stringifiedFilter);
        resetQueryDefinition(type, schema, pk, uniqueHookID, queries, filter);
      }
    }
  }, [data, pk, schema, type, queries, uniqueHookID, lastFilter, rows, airBrake]);

  const transformer = store?.getRecordTransform(type);
  const effectiveTransformer = transformer ? transformer.deserialize : (x: any) => x;
  const returnData: T[] = [];
  data.forEach((item: any) => {
    const identifier = typeof item === 'string' ? item : item[pk];
    const possibleRow = rows[identifier];
    if (possibleRow) {
      const thing: any = store?.deserialize(possibleRow, schema);
      returnData.push(effectiveTransformer(thing) as T);
    }
  });
  return returnData;
}
