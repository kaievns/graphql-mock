import Mock from './mock';
import { Request } from './history';
import { normalize, deepEqual } from './utils';

const mockMatch = (mock: Mock, request: Request) => {
  const queryMatch = request.query && mock.query === request.query;
  const mutationMatch = request.mutation && mock.query === request.mutation;
  const variablesMatch = mock.variables ? deepEqual(mock.variables, request.variables) : true;

  return (queryMatch || mutationMatch) && variablesMatch;
};

export default class Expectations {
  mocks: Mock[] = [];

  reset() {
    this.mocks = [];
  }

  expect(query: string | any) {
    let variables;
    let actualQuery;

    if (query.query || query.mutation) {
      // assuming it's an apollo-ish { query, variables } deal
      variables = query.variables;
      actualQuery = query.query || query.mutation;
    } else {
      // assuming it's a string or a parsed graphql query
      actualQuery = query;
    }

    const mock = new Mock({ query: normalize(actualQuery), variables });
    this.mocks.push(mock);
    return mock;
  }

  findMockResponseFor(request: Request) {
    const mock = this.mocks.find(m => mockMatch(m, request));

    if (!mock) {
      return null;
    }

    mock.register(request.variables);

    return mock.response;
  }
}
