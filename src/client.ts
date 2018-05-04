import { ApolloClient, ApolloQueryResult, ObservableQuery, WatchQueryOptions, MutationOptions } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import { FetchResult } from 'apollo-link';

const patchResponse = (original: any, mocked: any | void) => {
  if (mocked) {
    if (original instanceof Promise) {
      return Promise.resolve(mocked);
    }

    original.currentResult = () => mocked;
  }
  
  return original;
};

export default class MockClient extends ApolloClient<NormalizedCacheObject> {
  findMockFor: (options: any) => any | void;

  constructor(typeDefs: string | GraphQLSchema, mocks?: any, resolvers?: any) {
    const schema = typeof typeDefs === 'string' ? makeExecutableSchema({ typeDefs, resolvers }) : typeDefs;

    addMockFunctionsToSchema({ schema, mocks });

    const cache = new InMemoryCache((window as any).__APOLLO_STATE__);
    const link = new SchemaLink({ schema });

    super({ link, cache });
  }

  notify(callback: (options: any) => any | void) {
    this.findMockFor = callback;
  }

  query<T>(options: WatchQueryOptions): Promise<ApolloQueryResult<T>> {
    const result = super.query<T>(options);
    return patchResponse(result, this.findMockFor(options));
  }

  watchQuery<T>(options: WatchQueryOptions): ObservableQuery<T> {
    const result = super.watchQuery<T>(options);
    return patchResponse(result, this.findMockFor(options));
  }

  mutate<T>(options: MutationOptions<T>): Promise<FetchResult<T, any>> {
    const result = super.mutate<T>(options);
    return patchResponse(result, this.findMockFor(options));
  }
}
