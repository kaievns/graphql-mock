import MockClient from './client';
import Expectations from './expect';
import History, { Request } from './history';
import { GraphQLSchema } from 'graphql';

export * from './utils';
export { Request } from './history';


export default class GraphQLMock {
  client: MockClient;
  history = new History();
  expectations = new Expectations();
  

  constructor(schema: string | GraphQLSchema, mocks: object = {}, resolvers?: any) {
    this.client = new MockClient(schema, mocks, resolvers);
    this.client.notify(this.registerRequest);
  }

  reset() {
    this.history.reset();
    this.expectations.reset();
  }

  expect(query: string) {
    return this.expectations.expect(query);
  }

  private registerRequest = ({ query, mutation, variables }: any) => {
    const queryKey = mutation ? 'mutation' : 'query';
    const queryParams = { [queryKey]: name === 'mutate' ? mutation : query, variables };

    this.history.register({ query, mutation, variables });

    return this.expectations.forQuery(queryParams[queryKey]);
  }
}
