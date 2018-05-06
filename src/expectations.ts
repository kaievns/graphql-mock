import { ApolloError } from 'apollo-client';
import Mock from './mock';
import { Request } from './history';
import { normalize } from './utils';

const mockMatch = (mock: Mock, request: Request) => {
  const queryMatch = request.query && mock.query === request.query;
  const mutationMatch = request.mutation && mock.query === request.mutation;

  return queryMatch || mutationMatch;
};

export default class Expectations {
  mocks: Mock[] = [];

  reset() {
    this.mocks = [];
  }

  findMockResponseFor(request: Request) {
    const mock = this.mocks.find(m => mockMatch(m, request));

    if (!mock) { return null; }

    mock.register(request.variables);

    return mock.response;
  }

  expect(query: string | any) {
    let variables;
    let actualQuery;

    if (query.query || query.mutation) { // assuming it's an apollo-ish { query, variables } deal
      variables = query.variables;
      actualQuery = query.query || query.mutation;
    } else { // assuming it's a string or a parsed graphql query
      actualQuery = query;
    }

    const mock = new Mock({ query: normalize(actualQuery), variables });
    this.mocks.push(mock);
    return mock;
  }
}
