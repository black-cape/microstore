# MicroStore

![MicroStore Logo](https://github.com/black-cape/microstore/raw/refs/heads/main/logo.png)

**A powerful TypeScript React data normalization library that provides a single source of truth for your application state.**

MicroStore is an abstract data normalization layer for React projects that eliminates data duplication across AJAX / fetch requests and provides reactive access to normalized records. Built on [TinyBase](https://tinybase.org/), it automatically interprets REST API responses and maintains a consistent, normalized data record layer that your UI can reactively subscribe to. Each component using the reactivity layer still receives immutable copies of each record, but they will always be in sync.

## 🚀 Features

- **🎯 Single Source of Truth**: Eliminates data duplication by normalizing records across all API requests
- **⚡ Reactive Updates**: Components automatically re-render when normalized data changes
- **🔄 Automatic REST Interpretation**: Built-in support for Ember REST Adapter and fastapi-cruddy-framework response formats
- **🔌 Provider Agnostic**: Works with any AJAX library (ky, axios, fetch) or query cache (React Query, SWR)
- **🛡️ TypeScript First**: Fully typed with comprehensive schema validation
- **🎨 Transform System**: Flexible field and record-level data transformations
- **⚡ Performance Optimized**: Built on TinyBase for efficient storage and queries

## 📦 Installation

```bash
npm install @black-cape/microstore
# or
yarn add @black-cape/microstore
# or
pnpm add @black-cape/microstore
```

## ⚛️ React Compatibility

MicroStore supports both **React 18** and **React 19**:

- ✅ **React 18.0+**: Full compatibility with all features
- ✅ **React 19.0+**: Full compatibility with latest React features
- 🔧 **React Compiler**: Optional support for React's experimental compiler

### Testing Compatibility

Test your specific React version:

```bash
# Test with React 18
npm install react@^18.0.0 react-dom@^18.0.0
npm run test:compatibility

# Test with React 19
npm install react@^19.0.0 react-dom@^19.0.0
npm run test:compatibility
```

## 🏃 Quick Start

### 1. Define Your Schemas

```typescript
import { MicroStore, MicroStoreProvider, useReactive } from '@black-cape/microstore';

// Define your data schemas
const schemas = {
  user: {
    id: { type: 'string', primaryKey: true },
    name: { type: 'string' },
    email: { type: 'string' },
    tags: { type: 'string', transform: 'json' }, // Will serialized / deserialized into and out of tinybase as JSON
    preferences: { type: 'string', transform: 'json' } // Will serialized / deserialized into and out of tinybase as JSON
  },
  post: {
    id: { type: 'string', primaryKey: true },
    title: { type: 'string' },
    content: { type: 'string' },
    userId: { type: 'string' },
    tags: { type: 'string', transform: 'json' } // Will serialized / deserialized into and out of tinybase as JSON
  }
} as const;
```

### 2. Setup the Provider

```typescript
import { MicroStore, MicroStoreProvider } from '@black-cape/microstore';

const store = new MicroStore({ schemas });

function App() {
  return (
    <MicroStoreProvider store={store}>
      <UserList />
    </MicroStoreProvider>
  );
}
```

### 3. Use with React Query (or any data fetcher)

```typescript
import { useQuery } from '@tanstack/react-query';
import { useReactive, useMicroStore } from '@black-cape/microstore';

function UserList() {
  const store = useMicroStore();

  // Fetch data with React Query
  const { data: rawUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      const data = await response.json();

      // Push the response into MicroStore for normalization
      store?.pushPayload('GET', data);

      return data.users; // Return the raw array for React Query
    }
  });

  // useReactive ensures components get the normalized, single-source-of-truth data
  const users = useReactive('user', rawUsers || []);

  return (
    <ul>
      {users.map(user => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  );
}

function UserItem({ user }) {
  // This component will automatically re-render if this user
  // is updated anywhere else in the application!
  return (
    <li>
      {user.name} - {user.email}
      <small>Joined: {user.createdAt.toLocaleDateString()}</small>
    </li>
  );
}
```

## 🔌 Core Classes and Hooks

### `MicroStore`

The main store class that handles data normalization, storage, and retrieval.

```typescript
const store = new MicroStore({
  schemas,
  fieldTransforms?: FieldTransforms,
  recordTransforms?: RecordTransforms,
  interpreter?: MicrostoreInterpreter
});

// Push data from API responses
store.pushPayload('GET', response);
store.pushRecord('user', userData, 'POST');
store.pushRecords('user', userArray, 'GET');

// Direct data access
const user = store.peekRecord<User>('user', '123');
const allUsers = store.peekAll<User>('user');

// Data management
store.unloadRecord('user', '123');
store.unloadAll('user');
store.reset();
```

### `useReactive<T>(type: string, data: T[]): T[]`

React hook that wraps an array of records to provide reactive updates from the normalized store.

```typescript
function UserList() {
  const { data } = useQuery(['users'], fetchUsers);

  // Returns normalized users that update reactively
  // You can update individual records in MicroStore using
  // websockets, for instance, or if you have many components
  // querying for users on screen at different times, any REST response
  // that has the latest information on user x would cause user x
  // to synchronize across all components without additional queries
  const users = useReactive('user', data?.users || []);

  return <div>{users.map(user => <User key={JSON.stringify(user)} user={user} />)}</div>;
}
```

### `RESTInterpreter`

Built-in interpreter for standard REST API responses. Supports:

- **[Ember REST Adapter](https://api.emberjs.com/ember-data/release/classes/restadapter) format**
- **[fastapi-cruddy-framework](https://github.com/mdconaway/fastapi-cruddy-framework) format**
- Custom pluralized resource names

```typescript
// Automatically normalizes responses like:
{
  "users": [
    { "id": "1", "name": "John" },
    { "id": "2", "name": "Jane" }
  ],
  "posts": [
    { "id": "1", "userId": "1", "title": "Hello World" }
  ],
  "meta": { "total": 100 }
}
```

### `MicroStoreProvider`

React context provider that makes the store available to child components.

```typescript
<MicroStoreProvider store={store}>
  <App />
</MicroStoreProvider>
```

## 🔄 Data Flow

1. **API Request**: Use any HTTP client (fetch, ky, axios) or query library (React Query, SWR)
2. **Normalization**: Push response data into MicroStore via `pushPayload()`
3. **Storage**: Data is normalized, deduplicated, and stored in TinyBase
4. **Reactive Access**: Components use `useReactive()` to get live, normalized data
5. **Updates**: Any changes to normalized data automatically trigger component re-renders

## 🛠️ Advanced Features

### Custom Field Transforms

Transform data at the field level during serialization/deserialization:

```typescript
const customTransforms = {
  date: {
    serialize: (value: Date) => value.toISOString(),
    deserialize: (value: string) => new Date(value)
  },
  currency: {
    serialize: (value: number) => Math.round(value * 100), // Store as cents
    deserialize: (value: number) => value / 100 // Display as dollars
  }
};

const store = new MicroStore({
  schemas: {
    product: {
      id: { type: 'string', primaryKey: true },
      name: { type: 'string' },
      price: { type: 'number', transform: 'currency' },
      createdAt: { type: 'string', transform: 'date' }
    }
  },
  fieldTransforms: customTransforms
});
```

### Custom Record Transforms

Transform entire records during serialization/deserialization:

```typescript
const recordTransforms = {
  user: {
    serialize: (user: User) => ({
      ...user // you COULD omit the computed field (displayName) here, but it will be clipped out automatically by the field schema during storage
    }),
    deserialize: (userData: any) => ({
      ...userData,
      displayName: userData.fullName || userData.name // Computed field for UI
    })
  }
};
```

### Practical Zod Integration Example

You can use record transforms to integrate [Zod](https://zod.dev/) for robust type validation and transformation:

```typescript
import { z } from 'zod';

// Define Zod schema for validation and type inference
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  }),
  // Computed properties available only in class instances
  getDisplayName: z.function().returns(z.string()).optional()
});

// Create a User class with methods
class User {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public createdAt: Date,
    public preferences: { theme: 'light' | 'dark'; notifications: boolean }
  ) {}

  getDisplayName(): string {
    return `${this.name} (${this.email})`;
  }

  toJSON() {
    // Convert class instance to plain object for API serialization
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      preferences: this.preferences
    };
  }

  static fromJSON(data: any): User {
    // Validate and create User instance from plain object
    const validated = UserSchema.omit({ getDisplayName: true }).parse(data);
    return new User(
      validated.id,
      validated.email,
      validated.name,
      validated.createdAt,
      validated.preferences
    );
  }
}

// Configure record transforms with Zod validation
const recordTransforms = {
  user: {
    // serialize: receives User class instance, returns plain object for TinyBase storage
    serialize: (user: User) => {
      return user.toJSON(); // Convert class instance to POJO
    },
    // deserialize: receives POJO from TinyBase, returns User class instance for components
    deserialize: (userData: any) => {
      return User.fromJSON(userData); // Validate and convert to class instance
    }
  }
};

// Configure MicroStore with Zod-powered transforms
const store = new MicroStore({
  schemas: {
    user: {
      id: { type: 'string', primaryKey: true },
      email: { type: 'string' },
      name: { type: 'string' },
      createdAt: { type: 'string', transform: 'json' }, // Dates serialized as ISO strings
      preferences: { type: 'string', transform: 'json' } // Objects serialized as JSON
    }
  },
  recordTransforms
});

// Usage in components - you receive fully validated User class instances
function UserProfile({ userId }: { userId: string }) {
  const user = store.peekRecord<User>('user', userId);

  return (
    <div>
      <h1>{user?.getDisplayName()}</h1> {/* Class method available */}
      <p>Theme: {user?.preferences.theme}</p>
      <p>Notifications: {user?.preferences.notifications ? 'On' : 'Off'}</p>
    </div>
  );
}
```

**Benefits of Zod Integration:**

- **Runtime Validation**: Ensures data integrity when deserializing from storage
- **Type Safety**: Full TypeScript support with inferred types
- **Class Methods**: Enable rich domain models with behavior, not just data
- **Error Handling**: Automatic validation errors for malformed data
- **Schema Evolution**: Easy to update schemas as your API evolves

Your `deserialize` function receives a POJO (plain old javascript object) format object _after_ it has already been run through `tinybase` field level `deserialize` functions. (So your arrays will be arrays, objects will be objects, etc) You can then take this simple POJO record and transform it into more complex types that cannot be represented in raw JSON, like class instances, dates, etc. If you create a `zod`-based deserialize function, the expectation of the correlated `serialize` method handler would be to receive a record object in its `zod` format, and to then convert it into its pure POJO format before it is then delegated to the final field-level transformers before being pushed into `tinybase` for reactivity.

### Generating Schemas with ZodSchematizer

You can automatically generate MicroStore schemas from Zod models using TinyBase's [ZodSchematizer](https://tinybase.org/api/schematizer-zod/interfaces/schematizer/zodschematizer/):

```bash
# Install the ZodSchematizer
npm install tinybase schematizer-zod zod
```

```typescript
import { z } from 'zod';
import { createZodSchematizer } from 'schematizer-zod';

// Define your Zod models
const UserZodModel = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().min(0).max(120),
  isActive: z.boolean(),
  createdAt: z.date(), // Date object in application
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  }),
  tags: z.array(z.string())
});

const PostZodModel = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  userId: z.string(),
  publishedAt: z.date().nullable(),
  metadata: z.object({
    readTime: z.number(),
    wordCount: z.number()
  })
});

// Create the ZodSchematizer
const schematizer = createZodSchematizer({
  user: UserZodModel,
  post: PostZodModel
});

// Generate base TinyBase schemas
const baseTinyBaseSchemas = schematizer.getTablesSchema();

// Define custom field transforms for complex types
const customFieldTransforms = {
  date: {
    // serialize: convert Date object to ISO string for TinyBase storage
    serialize: (value: Date) => value.toISOString(),
    // deserialize: convert ISO string back to Date object for application use
    deserialize: (value: string) => new Date(value)
  }
};

// Convert to MicroStore schemas by adding MicroStore-specific properties
const microStoreSchemas = {
  user: {
    ...baseTinyBaseSchemas.user,
    // Override the id field to mark it as primary key
    id: { ...baseTinyBaseSchemas.user.id, primaryKey: true },
    // Add transforms for complex fields
    createdAt: { type: 'string', transform: 'date' }, // Use custom date transform
    preferences: { type: 'string', transform: 'json' },
    tags: { type: 'string', transform: 'json' }
  },
  post: {
    ...baseTinyBaseSchemas.post,
    // Override the id field to mark it as primary key
    id: { ...baseTinyBaseSchemas.post.id, primaryKey: true },
    // Add transforms for complex fields
    publishedAt: { type: 'string', transform: 'date' }, // Use custom date transform
    metadata: { type: 'string', transform: 'json' }
  }
} as const;

// Create MicroStore with generated schemas and custom transforms
const store = new MicroStore({
  schemas: microStoreSchemas,
  fieldTransforms: customFieldTransforms, // Add custom field transforms
  recordTransforms: {
    user: {
      // serialize: receives Zod model instance, returns POJO for TinyBase storage
      serialize: (user: z.infer<typeof UserZodModel>) => {
        // Convert Zod model to plain object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          isActive: user.isActive,
          createdAt: user.createdAt, // Date object - will be converted by field transform
          preferences: user.preferences,
          tags: user.tags
        };
      },
      // deserialize: receives POJO from TinyBase, returns Zod-validated model
      deserialize: (data: any) => {
        return UserZodModel.parse(data); // createdAt will be Date object from field transform
      }
    },
    post: {
      // serialize: receives Zod model instance, returns POJO for TinyBase storage
      serialize: (post: z.infer<typeof PostZodModel>) => {
        // Convert Zod model to plain object
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          userId: post.userId,
          publishedAt: post.publishedAt, // Date object - will be converted by field transform
          metadata: post.metadata
        };
      },
      // deserialize: receives POJO from TinyBase, returns Zod-validated model
      deserialize: (data: any) => {
        return PostZodModel.parse(data); // publishedAt will be Date object from field transform
      }
    }
  }
});
```

**Benefits of ZodSchematizer:**

- **Automatic Schema Generation**: Convert Zod models directly to TinyBase/MicroStore schemas
- **Type Consistency**: Ensure your validation schemas match your storage schemas
- **Reduced Boilerplate**: Less manual schema definition
- **Schema Evolution**: Update Zod models and regenerate schemas automatically
- **Validation Integration**: Natural integration between Zod validation and MicroStore storage

**Workflow:**

1. Define your domain models using Zod schemas
2. Use ZodSchematizer to generate base TinyBase schemas
3. Create custom field transforms for complex types (Date, etc.)
4. Enhance generated schemas with MicroStore properties (`primaryKey`, `transform`)
5. Add record transforms with serialize returning POJOs and deserialize returning validated models
6. Create MicroStore instance with enhanced schemas and field transforms

### Custom Interpreters

Create custom interpreters for non-standard API formats:

```typescript
function GraphQLInterpreter(data: any, options: any) {
  // Handle GraphQL responses, JSON:API, or any other format
  return {
    data: [
      {
        type: 'user',
        data: data.data.users
      }
    ],
    meta: data.meta
  };
}

const store = new MicroStore({
  schemas,
  interpreter: GraphQLInterpreter
});
```

## 🎯 Use Cases

### ✅ Perfect For

- **React applications with multiple data sources** that need consistent state
- **Applications fetching the same entities** from different API endpoints
- **Complex UIs** where the same data appears in multiple components
- **Real-time applications** that need reactive updates across components or use websockets
- **Data-heavy applications** that need efficient normalization and deduplication

## 🔗 Integration Examples

### With React Query

```typescript
function useUsers() {
  const store = useMicroStore();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      store?.pushPayload('GET', response.data);
      return response.data.users;
    }
  });
}

function UserList() {
  const { data } = useUsers();
  const users = useReactive('user', data || []);
  return <div>{/* Render users */}</div>;
}
```

### With SWR

```typescript
function useUsers() {
  const store = useMicroStore();

  return useSWR('/api/users', async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    store?.pushPayload('GET', data);
    return data.users;
  });
}
```

### With Ky

```typescript
const api = ky.create({
  hooks: {
    afterResponse: [
      async (request, _options, response) => {
        const data = await response.json();
        store.pushPayload(request.method, data);
        return response;
      }
    ]
  }
});
```

- If you use the `afterResponse` hook in your global `ky` api, you DON'T need to manually push data into your store in your `queryFn`s! The data will automagically be in your `MicroStore` and all you need to do is pass the IDs you want to render to `useReactive` in your components! This is thanks to the `RESTInterpreter` which will digest all of your Ember RESTAdapter compliant responses automatically. If you need to see a server framework that responds with the correct format, checkout [fastapi-cruddy-framework](https://github.com/mdconaway/fastapi-cruddy-framework)

## 📚 API Reference

### MicroStore Methods

| Method                                         | Description                           |
| ---------------------------------------------- | ------------------------------------- |
| `pushPayload(method, data, options?)`          | Normalize and store API response data |
| `pushRecord(type, record, method, options?)`   | Store a single record                 |
| `pushRecords(type, records, method, options?)` | Store multiple records                |
| `peekRecord<T>(type, id)`                      | Get a single record by ID             |
| `peekAll<T>(type)`                             | Get all records of a type             |
| `unloadRecord(type, id)`                       | Remove a record from store            |
| `unloadAll(type)`                              | Remove all records of a type          |
| `reset()`                                      | Clear entire store                    |

### Schema Options

| Property      | Type                                | Description                      |
| ------------- | ----------------------------------- | -------------------------------- |
| `type`        | `'string' \| 'number' \| 'boolean'` | Field data type                  |
| `primaryKey?` | `boolean`                           | Mark field as primary key        |
| `transform?`  | `string`                            | Apply named transform to field   |
| `default?`    | `any`                               | Default value for field          |
| `allowNull?`  | `boolean`                           | Available if using tinybase >= 7 |

## 📋 TODO

### 🔗 TinyBase Relationships Support

Add support for [TinyBase Relationships](https://tinybase.org/api/relationships/) to enable automatic relationship management between schemas:

- [ ] **Schema Relationship Definitions**: Allow defining relationships directly in schema configuration
- [ ] **Automatic Relationship Creation**: Auto-generate TinyBase relationships based on schema definitions
- [ ] **Relationship Queries**: Extend query capabilities to leverage relationships for efficient data access
- [ ] **Reactive Relationship Hooks**: Create hooks that reactively update when related data changes
- [ ] **Foreign Key Validation**: Validate and maintain referential integrity across related records
- [ ] **Cascade Operations**: Support cascade delete/update operations through relationships

Example future API:

### One-to-One Relationships (using belongsTo)

```typescript
const schemas = {
  user: {
    id: { type: 'string', primaryKey: true },
    name: { type: 'string' },
    email: { type: 'string' }
  },
  profile: {
    id: { type: 'string', primaryKey: true },
    userId: { type: 'string' }, // References user.id
    user: { belongsTo: 'user', key: 'userId' } // Virtual relationship field (feeds off of local foreign key)
    bio: { type: 'string' },
    avatar: { type: 'string' }
  }
} as const;

// Future hooks
const profile = useRelationship(user, 'profile'); // Get user's profile (inverse hasOne)
const user = useRelationship(profile, 'user'); // Get profile's user (belongsTo)
```

### One-to-Many Relationships (belongsTo + hasMany)

```typescript
const schemas = {
  user: {
    id: { type: 'string', primaryKey: true },
    name: { type: 'string' },
    posts: { hasMany: 'post', inverse: 'user' } // Virtual field for relationship
  },
  post: {
    id: { type: 'string', primaryKey: true },
    title: { type: 'string' },
    content: { type: 'string' },
    userId: { type: 'string' }, // Stores actual foreign key
    user: { belongsTo: 'user', key: 'userId' } // Virtual relationship field (feeds off of local foreign key)
  }
} as const;

// Future hooks
const posts = useRelationship(user, 'posts'); // Get all posts for a user (hasMany)
const author = useRelationship(post, 'user'); // Get post's author (belongsTo)
```

### Many-to-Many Relationships (through junction model)

```typescript
const schemas = {
  user: {
    id: { type: 'string', primaryKey: true },
    name: { type: 'string' },
    userTags: { hasMany: 'userTag', inverse: 'user' },
    tags: { hasMany: 'tag', through: 'userTags.tag' } // Through relationship
  },
  tag: {
    id: { type: 'string', primaryKey: true },
    name: { type: 'string' },
    color: { type: 'string' },
    userTags: { hasMany: 'userTag', inverse: 'tag' },
    users: { hasMany: 'user', through: 'userTags.user' } // Through relationship
  },
  userTag: {
    id: { type: 'string', primaryKey: true },
    userId: { type: 'string' },
    tagId: { type: 'string' },
    user: { belongsTo: 'user', key: 'userId' },
    tag: { belongsTo: 'tag', key: 'tagId' },
    createdAt: { type: 'string' } // Junction tables can have additional fields
  }
} as const;

// Future hooks for many-to-many
const userTags = useRelationship(user, 'tags'); // Get user's tags (through userTags)
const tagUsers = useRelationship(tag, 'users'); // Get tag's users (through userTags)
const userTagJunctions = useRelationship(user, 'userTags'); // Get actual junction records

// Post tagging example
const schemas = {
  post: {
    id: { type: 'string', primaryKey: true },
    title: { type: 'string' },
    postTags: { hasMany: 'postTag', inverse: 'post' },
    tags: { hasMany: 'tag', through: 'postTags.tag' }
  },
  tag: {
    id: { type: 'string', primaryKey: true },
    name: { type: 'string' },
    postTags: { hasMany: 'postTag', inverse: 'tag' },
    posts: { hasMany: 'post', through: 'postTags.post' }
  },
  postTag: {
    id: { type: 'string', primaryKey: true },
    postId: { type: 'string' },
    tagId: { type: 'string' },
    post: { belongsTo: 'post', key: 'postId' },
    tag: { belongsTo: 'tag', key: 'tagId' }
  }
} as const;

// Complex many-to-many usage
const tagsForPost = useRelationship(post, 'tags'); // Get all tags for a post
const postsForTag = useRelationship(tag, 'posts'); // Get all posts with a tag
```

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](./CONTRIBUTING.md) and submit pull requests to our repository.

We especially welcome contributions in these areas:

- 🧪 **Testing**: Help us add comprehensive test coverage
- 📖 **Documentation**: Improve examples and API documentation
- 🔗 **Relationships**: Implement TinyBase relationships support
- 🎯 **Transformers**: Add more field and record transform types
- 💡 **Examples**: Create real-world usage examples

See our [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on development workflow, code style, and pull request requirements.

## 📄 License

ISC License - see LICENSE file for details.

## 🔗 Related Projects

- [TinyBase](https://tinybase.org/) - The reactive data store powering MicroStore
- [fastapi-cruddy-framework](https://github.com/mdconaway/fastapi-cruddy-framework) - Compatible REST API framework
- [React Query](https://tanstack.com/query) - Recommended for data fetching
- [SWR](https://swr.vercel.app/) - Alternative data fetching solution
