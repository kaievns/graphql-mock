import * as React from 'react';
import { mount } from 'enzyme';
import * as fetch from 'node-fetch';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const uri = 'https://api.example.com/graphql';

export const client = new ApolloClient({
  link: new HttpLink({ uri, fetch }),
  cache: new InMemoryCache()
});

export const render = (element: JSX.Element) =>
  mount(
    <ApolloProvider client={client}>
      {element}
    </ApolloProvider>
  );

const schema = `
  type Item {
    id: ID!
    name: String!
  }

  type Query {
    items: [Item]
  }
`;

import GraphQLMock from '../src';

export const graphqlMock = new GraphQLMock({
  uri, schema, client
});
