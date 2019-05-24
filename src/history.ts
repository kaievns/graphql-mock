import { stringify, fillIn } from './utils';

export interface Request {
  query?: string;
  mutation?: string;
  variables?: any;
}

export default class History {
  requests: Request[] = [];

  reset() {
    this.requests = [];
  }

  register({ query, mutation, variables }: any) {
    const request = {} as Request;

    if (query) {
      request.query = stringify(query);
    }
    if (mutation) {
      request.mutation = stringify(mutation);
    }
    if (variables) {
      request.variables = variables;
    }

    this.requests.push(request);
  }

  get queries() {
    return this.requests
      .filter(r => !!r.query)
      .map(({ query, variables }) => fillIn(query, variables));
  }

  get mutations() {
    return this.requests
      .filter(r => !!r.mutation)
      .map(({ mutation, variables }) => fillIn(mutation, variables));
  }

  get lastRequest() {
    return this.requests[this.requests.length - 1];
  }

  get lastQuery() {
    const { queries } = this;
    return queries[queries.length - 1];
  }

  get lastMutation() {
    const { mutations } = this;
    return mutations[mutations.length - 1];
  }
}
