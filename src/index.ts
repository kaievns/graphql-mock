import MockClient from './client';
import Expectations from './expect';
import { stringify, fillIn } from './utils';
import { GraphQLSchema } from 'graphql';

export * from './utils';

export interface GQLRequest {
  variables: any;
  query?: string;
  mutation?: string;
}

export default class GraphQLMock {
  client: MockClient;
  requests: GQLRequest[] = [];
  expectations = new Expectations();

  constructor(schema: string | GraphQLSchema, mocks: object = {}, resolvers?: any) {
    this.client = new MockClient(schema, mocks, resolvers);
    this.client.notify(this.registerRequest);
  }

  reset() {
    this.requests = [];
    this.expectations.reset();
  }

  get queries(): string[] {
    return this.requests.filter(({ query }) => !!query).map(({ query, variables }) => fillIn(query, variables));
  }

  get mutations(): string[] {
    return this.requests.filter(({ mutation }) => !!mutation).map(({ mutation, variables }) => fillIn(mutation, variables));
  }

  get lastRequest(): GQLRequest | void {
    return this.requests[this.requests.length - 1];
  }

  get lastQuery(): string | void {
    const queries = this.queries;
    return queries[queries.length - 1];
  }

  get lastMutation(): string | void {
    const mutations = this.mutations;
    return mutations[mutations.length - 1];
  }

  expect(query: string) {
    return this.expectations.expect(query);
  }

  private registerRequest = ({ query, mutation, variables }: any) => {
    const queryKey = mutation ? 'mutation' : 'query';
    const queryParams = { [queryKey]: name === 'mutate' ? mutation : query, variables };

    this.requests.push({ [queryKey]: stringify(queryParams[queryKey]), variables });

    return this.expectations.forQuery(queryParams[queryKey]);
  }
}
