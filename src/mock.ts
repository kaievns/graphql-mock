import { deepEqual } from './utils';
import { ApolloError } from 'apollo-client';

export interface Constructor {
  query: string;
  data?: any;
  error?: ApolloError;
  loading?: boolean;
  variables?: any;
}

export default class Mock {
  query: string;
  calls: any[];
  data: any;
  error?: ApolloError;
  loading: boolean;
  variables: any;

  constructor({ query, data = {}, error, loading = false, variables }: Constructor) {
    this.query = query;
    this.data = data;
    this.error = error;
    this.loading = loading;
    this.variables = variables;
    this.calls = [];
  }

  register(variables: any) {
    this.calls.push(variables);
  }

  get response() {
    const { data, error, loading } = this;
    const response: any = { data, loading, networkStatus: error ? 'error' : 'ready' };

    if (error) { response.error = error; }

    return response;
  }

  get callCount() {
    return this.calls.length;
  }

  get notCalled() {
    return this.callCount === 0;
  }

  get called() {
    return this.callCount > 0;
  }

  get calledOnce() {
    return this.callCount === 1;
  }

  get calledTwice() {
    return this.callCount === 2;
  }

  calledWith(variables: any) {
    return this.calls.some(vars => deepEqual(vars, variables));
  }

  calledOnceWith(variables: any) {
    return this.calls.filter(vars => deepEqual(vars, variables)).length === 1;
  }
}
