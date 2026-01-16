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
