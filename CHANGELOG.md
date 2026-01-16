### [0.0.3]

- Refactor `useReactive` to support receiving an array of raw data from an http request, or an array of `string` or `number` ids, or a mixed array. This allows components to easily add reactive records to their rendering tree without directly interacting with HTTP methods.
- Refactor `useReactive` to use `Set` wherever possible to improve performance for large lists.

### [0.0.2]

- Update README for `npm` to include correct @scope.

### [0.0.1]

- Initial release
