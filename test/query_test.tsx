import * as React from 'react';
import { graphql, Query } from 'react-apollo';
import gql from 'graphql-tag';
import { mock, render } from './helper';
import { normalize } from '../src/utils';

const query = gql`
  query GetItems {
    items {
      id
      name
    }
  }
`;

const ToDos = ({ items, error, loading }: any) => {
  if (loading) { return <div>Loading...</div>; }
  if (error) { return <div>{error.message}</div>; }

  return (
    <ul>
      {items.map(item => <li key={item.id} >{item.name}</li>)}
    </ul>
  );
};

const DecoratedComponent = graphql(query)(
  ({ data: { items = [], error, loading } }: any) =>
    <ToDos items={items} error={error} loading={loading} />
);

const QueryComponent = () =>
  <Query query={query}>
    {({ data: { items = [] } = {}, error, loading }: any) =>
      <ToDos items={items} error={error} loading={loading} />
    }
  </Query>;

describe('query mocking', () => {
  [DecoratedComponent, QueryComponent].forEach(Component => {
  
    describe(`${Component === DecoratedComponent ? 'decorated' : 'wrapped'} component`, () => {
      it('handles mocked response', () => {
        mock.expect(query).reply({
          items: [
            { id: '1', name: 'one' },
            { id: '2', name: 'two' }
          ]
        });

        expect(render(<Component />).html()).toEqual('<ul><li>one</li><li>two</li></ul>');
      });

      it('allows to mock error states too', () => {
        mock.expect(query).fail('everything is terrible');

        expect(render(<Component />).html()).toEqual('<div>GraphQL error: everything is terrible</div>');
      });

      it('allows to simulate loading state too', () => {
        mock.expect(query).loading(true);
        expect(render(<Component />).html()).toEqual('<div>Loading...</div>');
      });
    });
  });

  it('registers requests in the history', () => {
    mock.expect(query).reply({ items: [] });    
    render(<QueryComponent />);
    expect(mock.history.requests).toEqual([
      {
        query: normalize(query)
      }
    ]);
  });
});
