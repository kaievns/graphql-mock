import { render, graphqlMock } from './helper';
import * as React from 'react';
import { graphql, Query } from 'react-apollo';
import { ApolloError } from 'apollo-client';
import gql from 'graphql-tag';
import { load } from 'nock';

interface Item {
  id: string;
  name: string;
}

interface Props {
  data: {
    loading: boolean
    items?: Item[]
    error?: ApolloError
  };
}

const query = gql`
  query GetItems {
    items {
      id
      name
    }
  }
`;

const Dummy = ({ items, error, loading }: any) => {
  if (loading) { return <div>Loading...</div>; }
  if (error) { return <div>{error.message}</div>; }

  return (
    <ul>
      {items.map(item => <li key={item.id} >{item.name}</li>)}
    </ul>
  );
};

const WrappedComponent = graphql<null, null, Props>(query)(
  ({ data: { items = [], error, loading } }: Props) => 
    <Dummy items={items} error={error} loading={loading} />
);

describe('graphqlMock', () => {
  beforeEach(() => graphqlMock.reset());

  describe('with a decorated component', () => {
    it('allows to stub the returned data', () => {
      graphqlMock.expect(query).reply({
        items: [
          { id: '1', name: 'one' },
          { id: '2', name: 'two' }
        ]
      });

      const wrapper = render(<WrappedComponent />);
      expect(wrapper.html()).toEqual('<ul><li>one</li><li>two</li></ul>');
    });

    it('allows to test failure states', () => {
      graphqlMock.expect(query).fail({
        message: 'everything is terrible'
      });

      const wrapper = render(<WrappedComponent />);
      expect(wrapper.html()).toEqual('<div>GraphQL error: everything is terrible</div>');
    });

    it('allows to test loading states', () => {
      graphqlMock.expect(query).loading();

      const wrapper = render(<WrappedComponent />);
      expect(wrapper.html()).toEqual('<div>Loading...</div>');
    });
  });

  describe('with a Query component', () => {
    const QueryComponent = () =>
      <Query query={query}>
        {({ data: { items = [] } = {}, error, loading }: any) =>
          <Dummy items={items} error={error} loading={loading} />
        }
      </Query>;

    it('renders good', () => {
      graphqlMock.expect(query).reply({
        items: [
          { id: '1', name: 'one' },
          { id: '2', name: 'two' }
        ]
      });

      expect(render(<QueryComponent />).html()).toEqual('<ul><li>one</li><li>two</li></ul>');
    });

    it('allows to mock errors too', () => {
      graphqlMock.expect(query).fail('everything is terrible');

      expect(render(<QueryComponent />).html()).toEqual('<div>GraphQL error: everything is terrible</div>');
    });

    it('allows to test loading states', () => {
      graphqlMock.expect(query).loading();

      const wrapper = render(<QueryComponent />);
      expect(wrapper.html()).toEqual('<div>Loading...</div>');
    });
  });


  describe('#requests', () => {
    it('has an empty list by default', () => {
      expect(graphqlMock.requests).toEqual([]);
    });

    it('records the requests', () => {
      render(<WrappedComponent />).html();

      expect(graphqlMock.requests).toEqual([
        {
          variables: undefined,
          query: 'query GetItems {\n  items {\n    id\n    name\n  }\n}\n'
        }
      ]);
    });

    it('returns the last request', () => {
      render(<WrappedComponent />);

      expect(graphqlMock.lastRequest).toEqual({
        variables: undefined,
        query: 'query GetItems {\n  items {\n    id\n    name\n  }\n}\n'
      });
    });
  });

  describe('#queries', () => {
    it('has an empty list by default', () => {
      expect(graphqlMock.queries).toEqual([]);
    });

    it('records all the queries', () => {
      render(<WrappedComponent />);

      expect(graphqlMock.queries).toEqual([
        'query GetItems {\n  items {\n    id\n    name\n  }\n}\n'
      ]);
    });

    it('allows access to the last query', () => {
      render(<WrappedComponent />);

      expect(graphqlMock.lastQuery).toEqual(
        'query GetItems {\n  items {\n    id\n    name\n  }\n}\n'
      );
    });
  });
});
