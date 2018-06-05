# Testing Queries

Lets assume you have a TodoList component that fires a graphql query to fetch the list
from an API end point. Something like this:

```js
import { Query } from 'react-apollo';

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
      if (loading) return <div>Loading...</div>;
      if (error) return <div>{error.message}</div>;

      return (
        <ul>
          {items.map(item =>
            <li key={item.id} >{item.name}</li>
          )}
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

const render = () => mount(
  <ApolloProvider client={graphqlMock.client}>
    <TodoList />
  </ApolloProvider>
);

describe('TodoList', () => {
  it('renders todo items good', () => {
    graphqlMock.expect(query).reply({ // <- `query` from the code above
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

Please refer to the [API Documentation](./api.md) for more detailed information
