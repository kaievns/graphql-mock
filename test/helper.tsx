import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as HooksProvider } from 'react-apollo-hooks';
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import GraphQLMock from '../src';

(global as any).expect = expect;
export { expect };

const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
});

(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = window.navigator;

// react 16 fake polyfill
(global as any).requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};

Enzyme.configure({ adapter: new Adapter() });

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

export const render = (element: JSX.Element) => {
  return Enzyme.mount(
    <ApolloProvider client={mock.client}>
      <HooksProvider client={mock.client}>{element}</HooksProvider>
    </ApolloProvider>
  );
};

beforeEach(() => {
  mock.reset();
});
