# GraphQL Client Side Mocking

This is a library that helps with the apollo graphql projects testing. Comparing
to a vanilla apollo testing setup this enables the following:

* to specify an exact response data
* test failure states
* test loading states
* assert which exact quieries and mutations sent by your code
* assert exact variables that sent along with queries/mutations


## Installation & Setup

```
npm add -D graphql-mock
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

If you already have an executable schema, you can pass it as is into the constructor:

```js
export default new GraphQLMock(myExecutableSchema);
```

## Testing Queries

Lets assume you have a TodoList component that fires a graphql query to fetch the list
from an API end point. Something like this:

```js
const query = gql`
  query GetItems {
    items {
      id
      name
    }
  }
`;

const TodoList = () =>
  <Query query={query}>
    {({ data: { items = [] } = {}, error, loading }: any) =>
      if (loading) { return <div>Loading...</div>; }
      if (error) { return <div>{error.message}</div>; }

      return (
        <ul>
          {items.map(item => <li key={item.id} >{item.name}</li>)}
        </ul>
      );
    }
  </Query>;
```

Here is how you can test it with enzyme and graphql-mock:

```js
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo';
import graphqlMock from './graphql';

const render = () => 
  <ApolloProvider client={graphqlMock.client}>
    <TodoList />
  </ApolloProvider>;

describe('TodoList', () => {
  it('renders todo items good', () => {
    graqhqlMock.expect(query).reply({ // <- query from the above code
      items: [
        { id: '1', name: 'one' },
        { id: '2', name: 'two' }
      ]
    });

    expect(render().html()).toEqual('<ul><li>one</li><li>two</li></ul>');
  });

  it('renders loading state too', () => {
    graphqlMock.expect(query).loading(true);

    expect(render().html()).toEqual('<div>Loading...</div>');
  });

  it('renders errors when API fails', () => {
    graphqlMock.expect(query).fails('everything is terrible');

    expect(render().html()).toEqual('<div>everything is terrible</div>');
  })
});
```

The query can be either a `GraphQLQuery` object, or a string, or an applo style
`{ query, variables }` object. __NOTE__: if you specify expected variables, the
mock will trigger to that specific query + variables combination only!

## Testing Mutations

Now lets pretend you have a componet that creates new TODO items:

```js
const mutation = gql`
  mutation GetItems($name: String!) {
    createItem(name: $name) {
      id
      name
    }
  }
`;

const CreatorComponent = () =>
  <Mutation mutation={mutation} onError={noop}>
    {(createItem, { data, loading, error }: any) => {
      if (loading) { return <div>Loading...</div>; }
      if (error) { return <div>{error.message}</div>; }
      if (data) { return <div id={data.createItem.id}>{data.createItem.name}</div>; }

      const onClick = () => createItem({ variables: { name: 'new item' } });

      return <button onClick={onClick}>click me</button>;
    }}
  </Mutation>;
```

Now here how you can test this component through and through with graphql-mock:

```js
const render = () => 
  <ApolloProvider client={graphqlMock.client}>
    <CreatorComponent />
  </ApolloProvider>;

describe('CreatorComponent', () => {
  it('renders good by default', () => {
    expect(render().html()).toEqual('<button>click me</button>');
  });

  it('sends mutations and renders responses', () => {
    graphqlMock.expect(mutation).reply({
      createItem: { id: 1, name: 'new item' }
    });

    const wrapper = render();
    wrapper.find('button').simulate('click');

    expect(wrapper.html()).toEqual('<div id="id">new item</div>');
  });

  it('sends correct variables with the request', () => {
    const mock = graphqlMock.expect(mutation).reply({
      createItem: { id: 1, name: 'new item' }
    });

    const wrapper = render();
    wrapper.find('button').simulate('click');

    expect(mock.calls[0]).toEqual([{ name: 'new item' }]);
  });

  it('can take a failure and live another day', () => {
    graphqlMock.expect(mutation).fail('everything is terrible');

    const wrapper = render();
    wrapper.find('button').simulate('click');

    expect(wrapper.html()).toEqual('<div>everything is terrible</div>');
  });
});
```


## API & Stuff

`#client` -> a reference to the underline ApolloClient instance

`#reset()` -> to reset all the mocks and queries history

`#history` -> the log of all queries and mutations along with variables

`#allowUnmockedRequests(state)` -> switch on/off an option to allow unmocked queries to fall through

## Copyright & License

All code in this library released under the terms of the MIT license

Copyright (C) 2018 Nikolay Nemshilov
