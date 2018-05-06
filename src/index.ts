import MockClient from './client';
import Expectations from './expectations';
import History from './history';
import { GraphQLSchema } from 'graphql';

export * from './utils';
export { Request } from './history';


export default class GraphQLMock {
  client: MockClient;
  history = new History();
  expectations = new Expectations();
  
  constructor(schema: string | GraphQLSchema, mocks: object = {}, resolvers?: any) {
    this.client = new MockClient(schema, mocks, resolvers);

    this.client.notify(({ query, mutation, variables }: any) => {
      this.history.register({ query, mutation, variables });

      return this.expectations.findMockResponseFor(this.history.lastRequest);
    });
  }

  reset() {
    this.history.reset();
    this.expectations.reset();
  }

  expect(query: string) {
    return this.expectations.expect(query);
  }
}
