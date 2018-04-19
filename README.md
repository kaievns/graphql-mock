# GraphQL Client Side Mocking

This is a little library that helps with the apollo graphql projects testing.
Essentially it's a wrapper over the `SchemaLink` to make it a bit more useful
in a React app testing schenario.

At the basic level it adds two things: an option to check which queries were
sent, and mock responses.

## Installation & Usage

```
npm add -D graphq-mock
```

thow this somewhere in your testing environment setup

```js
import GraphQLMock from 'graphql-mock';

const schema = `
  type Item {
    id: ID!
    name: String!
  }

  type Query {
    items: [Item]
  }
`;

// optional mocks
const mocks = {
  ... // your regular apollo mocks
};

// optional resolvers
const resolvers = {
  ... // graphql resolvers
};

export default new GraphQLMock(schema, mocks, resolvers);
```

Then use like so in your enzyme tests:

```js
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo';
import { normalize } from 'graphql-mock';
import graphqlMock from './graphql';

import TodoList from 'src/my/component';

it('shoulda render alright', () => {
  const query = `
    query GetItems {
      items {
        id
        name
      }
    }
  `;

  graqhqlMock.expect(query).reply({
    items: [
      { id: '1', name: 'one' },
      { id: '2', name: 'two' }
    ]
  });

  const wrapper = mount(
    <ApolloProvider client={graphqlMock.client}>
      <TodoList />
    </ApolloProvider>
  );

  expect(wrapper.html()).toEqual('<ul><li>one</li><li>two</li></ul>');
  expect(graphqlMock.lastQuery).toEqual(normalize(query));
});
```

## Testing Error States

you can test failure states by using the `expect` + `fail` combo. here are some examples

```js
  graqhqlMock.expect(query).fail('everything is terrible');
  graqhqlMock.expect(query).fail([
    { mesage: 'everything is terrible' },
    // ...
  ]);
  graqhqlMock.expect(query).fail(new ApolloError({ .... }));
```

## Using Existing Schema

If you have your own schema, for example to use custom resolvers, you pass a schema
instance into the `GraphqlMock` constructor:

```js
const typeDefs = `
`;

const resolvers = {
  // ...
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const mock = new GraphqlMock(schema);
```

## Using Existing ApolloClient

If you have your own flavour configured ApolloClient already setup and ready to go,
you can use it instead of a schema:

```
const mock = new GraphqlMock(myOwnClient);
```

__NOTE__: this is not going to work with url linked clients


## API & Stuff

`#client` -> a reference to the underline ApolloClient instance

`#reset()` -> to reset all the mocks and queries history

`#queries` -> the list of (string and normalized) queries that sent to the endpoint

`#lastQuery` -> returns the last query that sent

`#requests` -> requests (queries + variables) that sent to the server

`#lastRequest` -> return the last request that sent

`#expect(query: string)` -> an API to mock the exact responses

also some helper functions:

```js
import { parse, stringify, normalize } from 'graphql-mock';

parse(query) // turns a string query into an object
stringify(query) // turns an object into a standardly formatted string query
normalize(query) // turns an object or string query into a standard formatted string query
```

## Copyright & License

All code in this library released under the terms of the MIT license

Copyright (C) 2018 Nikolay Nemshilov
