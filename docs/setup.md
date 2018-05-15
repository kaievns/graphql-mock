# Setup & Configuration

The setup is generally fairly straight forward

```
npm add -D graphql-mock
```

thow this somewhere in your testing environment setup

```js
import GraphQLMock from 'graphql-mock';

const typeDefs = `
  type Item {
    id: ID!
    name: String!
  }

  type Query {
    items: [Item]
  }
`;

const mock = new GraphQLMock(typeDefs);
```

You can also pass optional mocks and resolvers if you need those to accompany your schema:

```js
const mocks = {
  // the usual apollo mocks
};

const resolvers = {
  // the usual apollo resolvers
};

const mock = new GraphQLMock(typeDefs, mocks, resolvers);
```

## Re-using Existing Schema

If you already have an executable schema defined somewhere in your project, 
you can pass it as is into the constructor as the first argument. This will
work as well.

```js
const mock = new GraphQLMock(myExecutableSchema);
```

## Tapping Into TestSuite

It is generally a good idea to reset all the mocks, history and expectations
before each test. You can accomplish this by calling the following:

```js
beforeEach(() => mock.reset());
```

## Enabling/Disabling Unmocked Requests

By default `GraphQLMock` will raise errors when it detects any unexpected
queries or mutations. This is useful if one wants a watertight set of expectations
from their code, what the code can and cannot call.

But, if for some reason, you would prefer this would not happen, you can disable
the feature by calling the following:

```js
mock.allowUnmockedRequests(true);
```

in this case all unrecognized requests will fall through and picked up by
apollo schema link which will return the randomly generated schema from mocks and resolvers.
