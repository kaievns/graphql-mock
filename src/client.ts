import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

export default function MockClient(typeDefs: string | GraphQLSchema, mocks: any = {}, resolvers?: any): ApolloClient<NormalizedCacheObject> {
  const schema = typeof typeDefs === 'string' ? makeExecutableSchema({ typeDefs, resolvers }) : typeDefs;

  addMockFunctionsToSchema({ schema, mocks });

  const cache = new InMemoryCache((window as any).__APOLLO_STATE__);
  const link = new SchemaLink({ schema });

  return new ApolloClient({ link, cache });
}
