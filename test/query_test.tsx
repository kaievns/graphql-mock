import * as React from 'react';
import { Query } from 'react-apollo';
import * as sinon from 'sinon';
import { useQuery } from '@apollo/react-hooks';
import { useQuery as rahUseQuery } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import { mock, render, expect } from './helper';
import { normalize } from '../src/utils';

const sandbox = sinon.createSandbox();

export const query = gql`
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

export const ApolloHooksQueryComponent = () => {
  const { data, error, loading } = useQuery(query);
  const { items = [] } = data || {};

  return <ToDos items={items} error={error} loading={loading} />;
};

export const HookedQueryComponent = () => {
  const { data, error, loading } = rahUseQuery(query);
  const { items = [] } = data || {};

  return <ToDos items={items} error={error} loading={loading} />;
};

export const CompleteCallbackComponent = ({ onCompleted }: any) => {
  const { data, error, loading } = useQuery(query, { onCompleted });
  const { items = [] } = data || {};

  return <ToDos items={items} error={error} loading={loading} />;
};

describe('query mocking', () => {
  afterEach(() => sandbox.restore());

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

  describe('apollo-hooks component', () => {
    it('handles mocked response', () => {
      mock.expect(query).reply({
        items: [{ id: '1', name: 'one' }, { id: '2', name: 'two' }],
      });

      expect(render(<ApolloHooksQueryComponent />).html()).to.eql(
        '<ul><li>one</li><li>two</li></ul>'
      );
    });

    it('allows to mock error states too', () => {
      mock.expect(query).fail('everything is terrible');

      expect(render(<ApolloHooksQueryComponent />).html()).to.eql(
        '<div>GraphQL error: everything is terrible</div>'
      );
    });

    it('allows to simulate loading state too', () => {
      mock.expect(query).loading(true);
      expect(render(<ApolloHooksQueryComponent />).html()).to.eql('<div>Loading...</div>');
    });
  });

  describe('hooked component', () => {
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

  describe('onCompleted callback', () => {
    it('triggers on success', () => {
      const response = { items: [{ id: '1', name: 'one' }, { id: '2', name: 'two' }] };
      mock.expect(query).reply(response);

      const spy = sandbox.spy();

      expect(render(<CompleteCallbackComponent onCompleted={spy} />).html()).to.eql(
        '<ul><li>one</li><li>two</li></ul>'
      );

      expect(spy.firstCall.args[0]).to.eql(response);
    });

    it('does not trigger on failure', () => {
      mock.expect(query).fail('everything is terrible');

      const spy = sandbox.spy();

      expect(render(<CompleteCallbackComponent onCompleted={spy} />).html()).to.eql(
        '<div>GraphQL error: everything is terrible</div>'
      );

      expect(spy.callCount).to.equal(0);
    });

    it('does not trigger cwhen loading', () => {
      mock.expect(query).loading(true);

      const spy = sandbox.spy();

      expect(render(<CompleteCallbackComponent onCompleted={spy} />).html()).to.eql(
        '<div>Loading...</div>'
      );

      expect(spy.callCount).to.equal(0);
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
