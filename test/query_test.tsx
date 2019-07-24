import * as React from 'react';
import { Query } from 'react-apollo';
import { useQuery } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import { mock, render, expect } from './helper';
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
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};

export const QueryComponent = () => (
  <Query query={query}>
    {({ data: { items = [] } = {}, error, loading }: any) => (
      <ToDos items={items} error={error} loading={loading} />
    )}
  </Query>
);

export const HookedQueryComponent = () => {
  const { data, error, loading } = useQuery(query);
  const { items = [] } = data || {};

  return <ToDos items={items} error={error} loading={loading} />;
};

describe.only('query mocking', () => {
  describe('Wrapped component', () => {
    it('handles mocked response', () => {
      mock.expect(query).reply({
        items: [{ id: '1', name: 'one' }, { id: '2', name: 'two' }],
      });

      expect(render(<QueryComponent />).html()).to.eql('<ul><li>one</li><li>two</li></ul>');
    });

    it('allows to mock error states too', () => {
      mock.expect(query).fail('everything is terrible');

      expect(render(<QueryComponent />).html()).to.eql(
        '<div>GraphQL error: everything is terrible</div>'
      );
    });

    it('allows to simulate loading state too', () => {
      mock.expect(query).loading(true);
      expect(render(<QueryComponent />).html()).to.eql('<div>Loading...</div>');
    });
  });

  describe.only('hooked component', () => {
    it('handles mocked response', () => {
      mock.expect(query).reply({
        items: [{ id: '1', name: 'one' }, { id: '2', name: 'two' }],
      });

      expect(render(<HookedQueryComponent />).html()).to.eql('<ul><li>one</li><li>two</li></ul>');
    });

    it('allows to mock error states too', () => {
      mock.expect(query).fail('everything is terrible');

      expect(render(<HookedQueryComponent />).html()).to.eql(
        '<div>GraphQL error: everything is terrible</div>'
      );
    });

    it('allows to simulate loading state too', () => {
      mock.expect(query).loading(true);
      expect(render(<HookedQueryComponent />).html()).to.eql('<div>Loading...</div>');
    });
  });

  it('registers requests in the history', () => {
    mock.expect(query).reply({ items: [] });
    render(<QueryComponent />);
    expect(mock.history.requests).to.eql([
      {
        query: normalize(query),
        variables: {},
      },
    ]);
  });
});
