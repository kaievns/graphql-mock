import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import MockClient from './client';
import { stringify } from './utils';

export * from './utils';

export interface GQLRequest {
  variables: any;
  query: string;
}

export default class GraphQLMock {
  public client: ApolloClient<NormalizedCacheObject>;
  public requests: GQLRequest[] = [];

  constructor(schema: string, mocks: object = {}) {
    this.client = MockClient(schema, mocks);
    this.patchClient();
  }

  public reset() {
    this.requests = [];
  }

  get queries(): string[] {
    return this.requests.map(({ query }) => query);
  }

  private patchClient() {
    ['query', 'watchQuery', 'mutate'].forEach(name => {
      const original = (this.client as any)[name];
      (this.client as any)[name] = ({ query, variables, ...rest }: any) => {
        if (query) { this.requests.push({
          query: stringify(query), variables
        });
        }

        return original.call(this, { query, variables, ...rest });
      };
    });
  }
}
