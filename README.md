# GraphQL Client Side Mocking

This is a library that helps with the apollo graphql projects testing.
Essentially it provides for `nock`/`sinon` style declarative testing,
and comparing to a vanilla apollo testing setup this enables the following:

* specify an exact response data
* test failure states
* test loading states
* assert which exact quieries and mutations sent by your code
* assert exact variables that sent along with queries/mutations

## Quick Example

```js
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo';
import { TodoList } from './components';
import { graphqlMock } from './helper';

const query = `
  query Todos {
    items {
      id
      name
    }
  }
`;

const render = () => mount(
  <ApolloProvider client={graphqlMock.client}>
    <TodoList />
  </ApolloProvider>
);

describe('<TodoList />', () => {
  it('renders what server returns', () => {
    graphqlMock.expect(query).reply([
      items: [
        { id: '1', name: 'one' },
        { id: '2', name: 'two' }
      ]
    ]);

    expect(render().html()).toEqual(
      '<ul><li>one</li><li>two</li></ul>'
    );
  });

  it('responds to failures gracefuly', () => {
    graphqlMock.expect(query).fails('everything is terrible');
    expect(render().html()).toEqual('<div>everything is terrible</div>');
  });

  it('shows the loading state too', () => {
    graphqlMock.expect(query).loading(true);
    expect(render().html()).toEqual('<div>Loading...</div>');
  });
});
```

Yes, it supports mutations too!

## Full Documentation

* [Basic Setup](./docs/setup.md)
* [Testing Queries](./docs/queries.md)
* [Testing Mutations](./docs/mutations.md)
* [API Documentation](./docs/api.md)


## Copyright & License

All code in this library released under the terms of the MIT license

Copyright (C) 2018 Nikolay Nemshilov
