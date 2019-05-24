import { ApolloClient, ApolloQueryResult, ObservableQuery, WatchQueryOptions, MutationOptions, OperationVariables } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

export type AnyApolloOptions = WatchQueryOptions | MutationOptions<any>;

type Callback = (something: any) => void;

const immediatelyResolvingPromise = (something: any) => {
  const promise = {
    then(callback: Callback) {
      return immediatelyResolvingPromise(callback(something));
    },

    catch() {
      return promise;
    }
  };

  return promise;
};

const immediatelyFailingPromise = (error: Error) => {
  const promise = {
    then() {
      return promise;
    },

    catch(callback: Callback) {
      return immediatelyResolvingPromise(callback(error));
    }
  };

  return promise;
};

const patchResponse = (original: any, mocked: any | void) => {
  if (mocked) {

    // mutations are handled as Promises in apollo
    if (original instanceof Promise) {
      if (mocked.error) {
        return immediatelyFailingPromise(mocked.error);
      } else if (mocked.loading) {
        return Promise.resolve(mocked);
      }

      return immediatelyResolvingPromise(mocked);
    }

    // regular and subscription queries
    original.currentResult = () => mocked;
  }
  
  return original;
};

export default class MockClient extends ApolloClient<NormalizedCacheObject> {
  findMockFor: (options: AnyApolloOptions) => any | void;

  constructor(typeDefs: string | GraphQLSchema, mocks?: any, resolvers?: any) {
    const schema = typeof typeDefs === 'string' ? makeExecutableSchema({ typeDefs, resolvers }) : typeDefs;

    addMockFunctionsToSchema({ schema, mocks });

    const cache = new InMemoryCache((window as any).__APOLLO_STATE__);
    const link = new SchemaLink({ schema });

    super({ link, cache });
  }

  notify(callback: (options: AnyApolloOptions) => any | void) {
    this.findMockFor = callback;
  }

  query<T>(options: WatchQueryOptions): Promise<ApolloQueryResult<T>> {
    const result = super.query<T>(options);
    return patchResponse(result, this.findMockFor(options));
  }

  watchQuery<T = any, TVariables = OperationVariables>(options: WatchQueryOptions<TVariables>): ObservableQuery<T, TVariables> {
    const result = super.watchQuery<T, TVariables>(options);
    return patchResponse(result, this.findMockFor(options));
  }

  mutate<T>(options: MutationOptions<T>): Promise<any> {
    const result = super.mutate<T>(options);
    return patchResponse(result, this.findMockFor(options));
  }
}
