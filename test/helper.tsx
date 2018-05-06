import * as React from 'react';
import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import GraphQLMock from '../src';

const schema = `
  type Item {
    id: ID!
    name: String!
  }

  type Query {
    items: [Item]
  }

  type Mutation {
    createItem(name: String!): Item
  }
`;

export const mock = new GraphQLMock(schema);

export const render = (element: JSX.Element) =>
  mount(
    <ApolloProvider client={mock.client}>
      {element}
    </ApolloProvider>
  );

beforeEach(() => mock.reset() );
