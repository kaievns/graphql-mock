import { mount } from 'enzyme';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

export const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.example.com/graphql' }),
  cache: new InMemoryCache()
});

export const render = (element: JSX.Element) =>
  mount(
    <ApolloProvider client={client}>
      {element}
    </ApolloProvider>
  );
