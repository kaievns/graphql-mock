import * as nock from 'nock';
import { parse } from 'url';
import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { stringify } from './utils';

export * from './utils';

export type Mock = (type: string) => object;

export interface Mocks {
  [key: string]: Mock;
}

export interface Options {
  uri: string;
  schema: string;
  client: ApolloClient<NormalizedCacheObject>;
  mocks?: Mocks;
}

export interface GQLRequest {
  variables: any;
  query: string;
}

export default class GraphQLMock {
  public mock: nock.Scope;
  public options: Options;
  public requests: GQLRequest[];

  constructor(options: Options) {
    this.options = options;
    this.requests = [];

    this.startListening();
    this.patchClient();
  }

  public reset() {
    this.requests = [];
  }

  get queries(): string[] {
    return this.requests.map(({ query }) => query);
  }

  private startListening() {
    const { hostname, port, path, protocol } = parse(this.options.uri);

    this.mock = nock(`${protocol}//${hostname}${port ? `:${port}` : ''}`);
    this.mock.post(path).times(Infinity).reply(200, {});
  }

  private patchClient() {
    const { client } = this.options;

    const watchQuery = client.watchQuery;

    client.watchQuery = ({ query, variables }) => {
      const result = watchQuery.call(this, { query, variables });

      this.requests.push({
        query: stringify(query), variables
      });

      result.currentResult = () => ({
        data: { items: [{ id: '1', name: 'one' }] }
      });

      return result;
    };
  }

  private cleanUpQuery(query: string) {
    return query.replace(/^\s+__typename\s*?\n/mg, '').trim();
  }
}
