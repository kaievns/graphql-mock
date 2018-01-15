import { render, client, graphqlMock } from './helper';
import * as React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

interface Item {
  id: string;
  name: string;
}

interface Props {
  data: {
    loading: boolean
    items?: Item[]
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
  ({ data: { items = [] } }: Props) => (
    <ul>
      {items.map(item => <li key={item.id} >{item.name}</li>)}
    </ul>
  )
);

describe('graphqlMock', () => {
  beforeEach(() => graphqlMock.reset());

  describe('#requests', () => {
    it('has an empty list by default', () => {
      expect(graphqlMock.requests).toEqual([]);
    });

    it('records the requests', () => {
      render(<WrappedComponent />).html();

      expect(graphqlMock.requests).toEqual([
        {
          variables: undefined,
          query: 'query GetItems {\n  items {\n    id\n    name\n  }\n}'
        }
      ]);
    });
  });

  describe('#queries', () => {
    it('has an empty list by default', () => {
      expect(graphqlMock.queries).toEqual([]);
    });

    it('records all the queries', () => {
      render(<WrappedComponent />).html();

      expect(graphqlMock.queries).toEqual([
        'query GetItems {\n  items {\n    id\n    name\n  }\n}'
      ]);
    });
  });
});
