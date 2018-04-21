import { ApolloClient } from 'apollo-client';
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
  public client: ApolloClient<any>;
  public requests: GQLRequest[] = [];
  public expectations = new Expectations();

  constructor(schema: string | GraphQLSchema | ApolloClient<any>, mocks: object = {}, resolvers?: any) {
    this.client = schema instanceof ApolloClient ? schema : MockClient(schema, mocks, resolvers);
    this.patchClient();
  }

  public reset() {
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

  public expect(query: string) {
    return this.expectations.expect(query);
  }

  private patchClient() {
    ['query', 'watchQuery', 'mutate'].forEach(name => {
      const original = (this.client as any)[name];
      (this.client as any)[name] = ({ query, mutation, variables, ...rest }: any) => {
        const queryKey = name === 'mutate' ? 'mutation' : 'query';
        const queryParams = { [queryKey]: name === 'mutate' ? mutation : query, variables };
        const observableQuery = original.call(this, { ...queryParams, ...rest });
        
        const mockedResponse = this.expectations.forQuery(queryParams[queryKey]);

        this.requests.push({ [queryKey]: stringify(queryParams[queryKey]), variables });

        if (mockedResponse) {
          const response = { loading: false, ...mockedResponse };

          if (observableQuery instanceof Promise) {
            return Promise.resolve(response);
          } else {
            observableQuery.currentResult = () => response;
          }
        }

        return observableQuery;
      };
    });
  }
}
