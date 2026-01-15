import { pluralize, singularize } from 'ember-inflector';
import { camelCase, isArray, omit } from 'lodash-es';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { jsx } from 'react/jsx-runtime';
import { createQueries, createStore } from 'tinybase';
import { Provider, useQueries, useResultTable } from 'tinybase/ui-react';
var K = Object.defineProperty;
var z = (o, e, r) =>
  e in o ? K(o, e, { enumerable: true, configurable: true, writable: true, value: r }) : (o[e] = r);
var f = (o, e, r) => z(o, typeof e != 'symbol' ? e + '' : e, r);
function l(o, e) {
  let r = { data: [], meta: void 0 },
    s;
  return (
    o !== void 0 &&
      Object.keys(o).forEach((t) => {
        let i = o[t];
        if (t !== 'meta') {
          let n = [],
            c = camelCase(singularize(t));
          (isArray(i)
            ? i.forEach((a) => {
                n.push(a);
              })
            : n.push(i),
            r.data.push({ data: n, type: c }));
        } else s = o[t];
      }),
    (r.meta = s),
    r
  );
}
var p = {
  serialize(o) {
    return o ? JSON.stringify(o) : null;
  },
  deserialize(o) {
    return o ? JSON.parse(o) : null;
  }
};
var N = ['transform', 'primaryKey'],
  q = { json: p },
  y = class {
    constructor(e) {
      f(this, 'schemas');
      f(this, 'fieldTransforms');
      f(this, 'recordTransforms');
      f(this, 'store');
      f(this, 'queries');
      f(this, 'interpreter');
      f(this, 'primaryKeys');
      ((this.primaryKeys = {}),
        (this.schemas = e.schemas ? e.schemas : {}),
        (this.fieldTransforms = { ...(e.fieldTransforms ? e.fieldTransforms : {}), ...q }),
        (this.recordTransforms = e.recordTransforms ? e.recordTransforms : {}),
        (this.interpreter = e.interpreter ? e.interpreter : l),
        (this.store = createStore()),
        this.store.setTablesSchema(this.transformSchemas()),
        (this.queries = createQueries(this.store)));
    }
    transformSchemas() {
      let e = {};
      return (
        Object.keys(this.schemas).forEach((r) => {
          if (
            ((e[r] = {}),
            Object.keys(this.schemas[r]).forEach((s) => {
              if (
                ((e[r][s] = omit(this.schemas[r][s], N)),
                this.schemas[r][s].primaryKey && this.schemas[r][s].type === 'string')
              ) {
                if (this.primaryKeys[r]) throw Error(`More than one primary key defined for schema ${r}`);
                this.primaryKeys[r] = s;
              }
            }),
            !this.getPrimaryKey(r) &&
              this.schemas[r].id &&
              this.schemas[r].id.type === 'string' &&
              (this.primaryKeys[r] = 'id'),
            !this.getPrimaryKey(r))
          )
            throw Error(
              `No primary key defined for schema ${r}. This schema must have an 'id' field of "type": "string", or another field of "type": "string" with "primaryKey": true.`
            );
        }),
        e
      );
    }
    getPrimaryKey(e) {
      let r = this.primaryKeys[e];
      return r || void 0;
    }
    getSchema(e) {
      return e && Object.hasOwn(this.schemas, e) ? this.schemas[e] : null;
    }
    getRecordTransform(e) {
      if (e) return this.recordTransforms[e] ? this.recordTransforms[e] : void 0;
    }
    getFieldTransform(e) {
      if (e) return this.fieldTransforms[e] ? this.fieldTransforms[e] : void 0;
    }
    serialize(e, r) {
      let s = {};
      return (
        Object.keys(e).forEach((t) => {
          let i = r[t];
          if (i) {
            let n = this.getFieldTransform(i.transform);
            s[t] = n ? n.serialize(e[t]) : e[t];
          }
        }),
        s
      );
    }
    deserialize(e, r) {
      let s = {};
      return (
        Object.keys(e).forEach((t) => {
          let i = r[t];
          if (i) {
            let n = i.transform && this.fieldTransforms[i.transform] ? this.fieldTransforms[i.transform] : void 0;
            s[t] = n ? n.deserialize(e[t]) : e[t];
          }
        }),
        s
      );
    }
    pushRecord(e, r, s, t = {}) {
      return this.pushRecords(e, [r], s, t);
    }
    pushRecords(e, r, s, t = {}) {
      let i = this.getRecordTransform(e),
        n = camelCase(pluralize(e));
      if (!i) return this.pushPayload(s, { [n]: r }, t);
      let c = r.map((a) => i.serialize(a));
      return this.pushPayload(s, { [n]: c }, t);
    }
    pushPayload(e, r, s = {}) {
      try {
        let t = this.interpreter(r, s);
        return (
          t.data.forEach((i) => {
            let n = this.getSchema(i.type);
            if (n) {
              let c = this.getPrimaryKey(i.type) || 'id';
              e === 'DELETE'
                ? i.data.forEach((a) => {
                    this.store.delRow(i.type, a[c]);
                  })
                : e === 'PATCH'
                  ? i.data.forEach((a) => {
                      this.store.getRow(i.type, a[c])
                        ? this.store.setPartialRow(i.type, a[c], this.serialize(a, n))
                        : this.store.setRow(i.type, a[c], this.serialize(a, n));
                    })
                  : i.data.forEach((a) => {
                      this.store.setRow(i.type, a[c], this.serialize(a, n));
                    });
            }
          }),
          t
        );
      } catch (t) {
        console.warn(t);
      }
    }
    peekRecord(e, r) {
      let s = this.getSchema(e),
        t = this.getPrimaryKey(e),
        i = this.getRecordTransform(e),
        n = i ? i.deserialize : (c) => c;
      if (s && t) {
        let c = this.getStore().getRow(e, r);
        if (c) return n(this.deserialize(c, s));
      }
    }
    peekAll(e) {
      let r = this.getSchema(e),
        s = this.getPrimaryKey(e),
        t = this.getRecordTransform(e),
        i = t ? t.deserialize : (n) => n;
      if (r && s) {
        let n = this.getStore().getTable(e);
        return Object.entries(n).map(([c, a]) => i(this.deserialize(a, r)));
      }
      return [];
    }
    unloadRecord(e, r) {
      let s = this.peekRecord(e, r);
      return (s && this.getStore().delRow(e, r), s);
    }
    unloadAll(e) {
      this.getSchema(e) && this.getStore().delTable(e);
    }
    reset() {
      Object.entries(this.schemas).forEach(([e, r]) => {
        this.unloadAll(e);
      });
    }
    getStore() {
      return this.store;
    }
    getQueries() {
      return this.queries;
    }
  };
var w = createContext(null);
function g() {
  return useContext(w);
}
function J(o) {
  let e = useMemo(() => o.store, [o]);
  return jsx(w.Provider, {
    value: e,
    children: jsx(Provider, { store: e.getStore(), queries: e.getQueries(), children: o.children })
  });
}
function U(o, e) {
  return o ? o.map((r) => r[e]) : [];
}
function G(o, e, r, s, t, i) {
  t.setQueryDefinition(s, o, ({ select: n, where: c }) => {
    (Object.keys(e).forEach((a) => {
      n(a);
    }),
      c((a) => i.includes(a(r))));
  });
}
function X(o, e) {
  let r = g(),
    s = r?.getSchema(o),
    t = r?.getPrimaryKey(o);
  if (!s || !t) throw new Error(`No MicroStore schema defined for type ${o}`);
  let [i, n] = useState(crypto.randomUUID()),
    c = useQueries(),
    a = useResultTable(i, c),
    [d, E] = useState(''),
    u = useRef('');
  useEffect(() => {
    if (c) {
      let m = U(e, t),
        h = JSON.stringify(m);
      d !== h && u.current !== h && (Object.entries(a).length > 0 && (u.current = h), E(h), G(o, s, t, i, c, m));
    }
  }, [e, t, s, o, c, i, d, a, u]);
  let R = r?.getRecordTransform(o),
    P = R ? R.deserialize : (m) => m,
    S = [];
  return (
    e.forEach((m) => {
      let h = m[t],
        T = a[h];
      if (T) {
        let v = r?.deserialize(T, s);
        S.push(P(v));
      }
    }),
    S
  );
}
export {
  p as json,
  y as MicroStore,
  J as MicroStoreProvider,
  l as RESTInterpreter,
  g as useMicroStore,
  X as useReactive
}; //# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map
