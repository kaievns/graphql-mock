import { ApolloClient } from 'apollo-client';
import MockClient from './client';
import Expectations from './expect';
import { stringify, fillIn } from './utils';
import { GraphQLSchema } from 'graphql';

export * from './utils';

export interface GQLRequest {
  variables: any;
  query: string;
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
    return this.requests.map(({ query }) => query);
  }

  get lastRequest(): GQLRequest | void {
    return this.requests[this.requests.length - 1];
  }

  get lastQuery(): string | void {
    const request = this.lastRequest;

    if (request) {
      const { query, variables = {} } = request;
      return fillIn(query, variables);
    }
  }

  public expect(query: string) {
    return this.expectations.expect(query);
  }

  private patchClient() {
    ['query', 'watchQuery', 'mutate'].forEach(name => {
      const original = (this.client as any)[name];
      (this.client as any)[name] = ({ query, variables, ...rest }: any) => {
        const response = original.call(this, { query, variables, ...rest });

        if (query) { 
          this.requests.push({ query: stringify(query), variables });
          const mockedResponse = this.expectations.forQuery(query);

          if (mockedResponse) {
            response.currentResult = () => ({
              loading: false, ...mockedResponse
            });
          }
        }

        return response;
      };
    });
  }
}
