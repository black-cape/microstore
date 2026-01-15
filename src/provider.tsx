// This software is provided to the United States Government (USG) with SBIR Data Rights as defined at Federal Acquisition Regulation 52.227-14, "Rights in Data-SBIR Program" (May 2014) SBIR Rights Notice (Dec 2026) These SBIR data are furnished with SBIR rights under Contract No. H9241522D0001. For a period of 19 years, unless extended in accordance with FAR 27.409(h), after acceptance of all items to be delivered under this contract, the Government will use these data for Government purposes only, and they shall not be disclosed outside the Government (including disclosure for procurement purposes) during such period without permission of the Contractor, except that, subject to the foregoing use and disclosure prohibitions, these data may be disclosed for use by support Contractors. After the protection period, the Government has a paid-up license to use, and to authorize others to use on its behalf, these data for Government purposes, but is relieved of all disclosure prohibitions and assumes no liability for unauthorized use of these data by third parties. This notice shall be affixed to any reproductions of these data, in whole or in part.
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Provider as TinyBaseProvider } from 'tinybase/ui-react';
import type { MicroStore } from './microstore';

const StoreContext = createContext<MicroStore | null>(null);

export function useMicroStore(): MicroStore | null {
  const store = useContext(StoreContext);

  return store;
}

type WithExistingStore = { store: MicroStore; children: ReactNode };

export function MicroStoreProvider(props: WithExistingStore) {
  const store = useMemo(() => props.store, [props]);

  // TODO: Add store.relationships, which can be passed to tinybase
  return (
    <StoreContext.Provider value={store}>
      <TinyBaseProvider store={store.getStore()} queries={store.getQueries()}>
        {props.children}
      </TinyBaseProvider>
    </StoreContext.Provider>
  );
}
