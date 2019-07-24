import { GraphQLSchema } from 'graphql';
import MockClient from './client';
import Expectations from './expectations';
import History from './history';
import Mock from './mock';
import Config from './config';

export * from './utils';
export { Request } from './history';
export { default as Mock } from './mock';

export default class GraphQLMock {
  client: MockClient;
  config = new Config();
  history = new History();
  expectations = new Expectations();

  private args: any;

  constructor(schema: string | GraphQLSchema, mocks: object = {}, resolvers?: any) {
    this.args = { schema, mocks, resolvers };
    this.client = this.getNewClient();
  }

  getNewClient() {
    const { schema, mocks, resolvers } = this.args;
    const client = new MockClient(schema, mocks, resolvers);

    client.notify(({ query, mutation, variables }: any) => {
      this.history.register({ query, mutation, variables });

      const mockResponse = this.expectations.findMockResponseFor(this.history.lastRequest);

      if (mockResponse == null && !this.config.allowUnmockedRequests) {
        const request = this.history.lastRequest;
        const vars = request.variables
          ? `\nVARIABLES:\n${JSON.stringify(variables, null, 2)}\n`
          : '';

        throw new Error(`Unexpected GraphQL request:\n${request.query || request.mutation}${vars}`);
      }

      return mockResponse;
    });

    return client;
  }

  reset() {
    this.history.reset();
    this.expectations.reset();

    this.client = this.getNewClient();
  }

  expect(query: string | any): Mock {
    return this.expectations.expect(query);
  }

  allowUnmockedRequests(state = true) {
    this.config.allowUnmockedRequests = state;
  }
}
