// This software is provided to the United States Government (USG) with SBIR Data Rights as defined at Federal Acquisition Regulation 52.227-14, "Rights in Data-SBIR Program" (May 2014) SBIR Rights Notice (Dec 2026) These SBIR data are furnished with SBIR rights under Contract No. H9241522D0001. For a period of 19 years, unless extended in accordance with FAR 27.409(h), after acceptance of all items to be delivered under this contract, the Government will use these data for Government purposes only, and they shall not be disclosed outside the Government (including disclosure for procurement purposes) during such period without permission of the Contractor, except that, subject to the foregoing use and disclosure prohibitions, these data may be disclosed for use by support Contractors. After the protection period, the Government has a paid-up license to use, and to authorize others to use on its behalf, these data for Government purposes, but is relieved of all disclosure prohibitions and assumes no liability for unauthorized use of these data by third parties. This notice shall be affixed to any reproductions of these data, in whole or in part.
// This whole file will get "genericized" so that it can wrap any useQuery that we currently use
// Right now it is hard coded to do object stuff...
// The same logic can be made more abstract and receive a couple more
// arguments to then handle ANYTHING. :)
import { useEffect, useRef, useState } from 'react';
import { type Queries } from 'tinybase';
import { useQueries, useResultTable } from 'tinybase/ui-react';
import { useMicroStore } from './provider';
import type { MicroStoreSchema } from './types';

function generateFilter(data: any[] | undefined, pk: string) {
  return data ? data.map((obj) => obj[pk]) : [];
}

function resetQueryDefinition(
  type: string,
  schema: MicroStoreSchema,
  pk: string,
  queryName: string,
  queries: Queries,
  filter: string[]
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
    where((getCell) => filter.includes(<string>getCell(pk)));
  });
}

// Wrap the objects in tinybase rows to make them react at a record level
// to individual record changes
export function useReactive<T>(type: string, data: T[]): T[] {
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
      const stringifiedFilter = JSON.stringify(filter);
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
    const identifier = item[pk];
    const possibleRow = rows[identifier];
    if (possibleRow) {
      const thing: any = store?.deserialize(possibleRow, schema);
      returnData.push(effectiveTransformer(thing) as T);
    }
  });
  return returnData;
}
