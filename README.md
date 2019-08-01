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
    graphqlMock.expect(query).fail('everything is terrible');
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

## react-apollo-hooks

TL;DR maybe just use `@apollo/react-hooks`, it works pretty great? No need for any hackery

`graphql-mock` will work with [react-apollo-hooks](https://github.com/trojanowski/react-apollo-hooks) 
as well. There are some caviates that relate to the internal implementation of react-apollo-hooks.

Firstly it uses internal memoisation for the queries, so you will need a new client with every 
render/test. `mock.client` will now automatically return you a new client every time after
`mock#reset()` called, so it should work fine, as long as you don't deconstruct the `client` into 
a variable outside of the render cycle.

```jsx
// use this
<ApolloProvider client={graphqlMock.client}>
  // ...
</ApolloProvider>

// NOT THIS
const { client } = graphqlMock;
<ApolloProvider client={client}>
  // ...
</ApolloProvider>
```

Secondly `react-apollo-hooks` wrap mutation requests into an extra level of promises, which
prevents us from processing the response right after an action. Meaning you'll need to wait
and update the render wrapper:

```jsx
graphqlMock.expect(mutation).reply({
  createItem: { id: 1, name: 'new item' }
});

const wrapper = render();
wrapper.find('button').simulate('click');

// you need to add those two
await new Promise(r => setTimeout(r, 10));
wrapper.update();

expect(wrapper.html()).toEqual('<div id="id">new item</div>');
```

## Copyright & License

All code in this library released under the terms of the MIT license

Copyright (C) 2018-2019 Nikolay Nemshilov
