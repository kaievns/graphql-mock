import { render, graphqlMock } from './helper';
import * as React from 'react';
import { graphql } from 'react-apollo';
import { ApolloError } from 'apollo-client';
import gql from 'graphql-tag';

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

const WrappedComponent = graphql<null, null, Props>(query)(
  ({ data: { items = [], error }: Props) => {
    if (error) {
      return <div>{error.message}</div>;
    }

    return (
      <ul>
        {items.map(item => <li key={item.id} >{item.name}</li>)}
      </ul>
    );
  }
);

describe('graphqlMock', () => {
  beforeEach(() => graphqlMock.reset());

  it('allows an unmocked render', () => {
    const wrapper = render(<WrappedComponent />);
    expect(wrapper.html()).toEqual('<ul></ul>');
  });

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
