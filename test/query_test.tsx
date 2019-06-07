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

const query2 = gql`
  query GetItems {
    items {
      id
    }
  }
`;

const query3 = gql`
  query GetItems {
    items {
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

export const HookedQueryComponent = ({ query }: any) => {
  const { data, error, loading } = useQuery(query);
  const { items = [] } = data || {};

  console.log('inside', { data, error, loading });

  return <ToDos items={items} error={error} loading={loading} />;
};

describe('query mocking', () => {
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

  describe('hooked component', () => {
    it('handles mocked response', () => {
      console.log('case 1', { before: mock.expectations.mocks.map(m => m.response) });
      mock.expect(query).reply({
        items: [{ id: '1', name: 'one' }, { id: '2', name: 'two' }],
      });
      console.log('case 1', { after: mock.expectations.mocks.map(m => m.response) });

      expect(render(<HookedQueryComponent query={query} />).html()).to.eql(
        '<ul><li>one</li><li>two</li></ul>'
      );
    });

    it('allows to mock error states too', () => {
      console.log({ before: mock.expectations.mocks.map(m => m.response) });

      mock.expect(query2).fail('everything is terrible');

      console.log({ after: mock.expectations.mocks.map(m => m.response) });

      expect(render(<HookedQueryComponent query={query2} />).html()).to.eql(
        '<div>GraphQL error: everything is terrible</div>'
      );
    });

    it('allows to simulate loading state too', () => {
      mock.expect(query3).loading(true);
      expect(render(<HookedQueryComponent query={query3} />).html()).to.eql(
        '<div>Loading...</div>'
      );
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
