# Testing Mutations

Lets pretend you have a componet that creates new TODO items:

```js
import { Mutation } from 'react-apollo';

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
      if (loading) return <div>Loading...</div>;
      if (error) return <div>{error.message}</div>;
      if (data) return <div id={data.createItem.id}>{data.createItem.name}</div>;

      const onClick = () => createItem({ variables: { name: 'new item' } });

      return <button onClick={onClick}>click me</button>;
    }}
  </Mutation>;
```

Now here how you can test this component through and through with graphql-mock:

```js
const render = () => mount(
  <ApolloProvider client={graphqlMock.client}>
    <CreatorComponent />
  </ApolloProvider>
);

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

  it('can take a failure and live to fight another day', () => {
    graphqlMock.expect(mutation).fail('everything is terrible');

    const wrapper = render();
    wrapper.find('button').simulate('click');

    expect(wrapper.html()).toEqual('<div>everything is terrible</div>');
  });
});
```

Please refer to the [API Documentation](./api.md) for more detailed information
