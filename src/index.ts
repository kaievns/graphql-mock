import { GraphQLSchema } from 'graphql';// eslint-disable-line
import MockClient from './client';
import Expectations from './expectations';
import History from './history';
import Mock from './mock'; // eslint-disable-line
import Config from './config';

export * from './utils';
export { Request } from './history';
export { default as Mock } from './mock';

export default class GraphQLMock {
  client: MockClient;
  config = new Config();
  history = new History();
  expectations = new Expectations();

  constructor(schema: string | GraphQLSchema, mocks: object = {}, resolvers?: any) {
    this.client = new MockClient(schema, mocks, resolvers);

    console.log('instantiating');

    this.client.notify(({ query, mutation, variables }: any) => {
      this.history.register({ query, mutation, variables });

      console.log({ expectations: this.expectations.mocks });
      console.log({ mocks: this.expectations.mocks.map(m => m.response) });

      const mockResponse = this.expectations.findMockResponseFor(this.history.lastRequest);

      console.log({ mockResponse });

      if (mockResponse == null && !this.config.allowUnmockedRequests) {
        const request = this.history.lastRequest;
        const vars = request.variables
          ? `\nVARIABLES:\n${JSON.stringify(variables, null, 2)}\n`
          : '';

        throw new Error(`Unexpected GraphQL request:\n${request.query || request.mutation}${vars}`);
      }

      return mockResponse;
    });
  }

  reset() {
    this.history.reset();
    this.expectations.reset();
  }

  expect(query: string | any): Mock {
    return this.expectations.expect(query);
  }

  allowUnmockedRequests(state = true) {
    this.config.allowUnmockedRequests = state;
  }
}
