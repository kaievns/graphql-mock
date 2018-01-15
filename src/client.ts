import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

export default function MockClient(typeDefs: string, mocks: any = {}): ApolloClient<NormalizedCacheObject> {
  const schema = makeExecutableSchema({ typeDefs });

  addMockFunctionsToSchema({ schema, mocks });

  const cache = new InMemoryCache((window as any).__APOLLO_STATE__);
  const link = new SchemaLink({ schema });

  return new ApolloClient({ link, cache });
}
