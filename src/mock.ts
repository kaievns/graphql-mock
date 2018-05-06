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
  variables: any;
  calls: any[];

  private results = {
    data: undefined as any,
    error: undefined as ApolloError,
    loading: false as boolean
  };

  constructor({ query, data = {}, error, loading = false, variables }: Constructor) {
    this.query = query;
    this.variables = variables;
    this.calls = [];

    this.reply(data);
    this.loading(loading);

    if (error) { this.fail(error); } 
  }

  reply(data: any) {
    this.results.data = data;
    return this;
  }

  fail(error: any | any[] | string) {
    const errors = typeof error === 'string' ? [{ message: error }] : error;

    this.results.error = error instanceof ApolloError ? error : new ApolloError({
      graphQLErrors: Array.isArray(errors) ? errors : [errors]
    });

    return this;
  }

  loading(state: boolean = true) {
    this.results.loading = state;
    return this;
  }

  get response() {
    const { data, error, loading } = this.results;
    const response: any = { data, loading, networkStatus: error ? 'error' : 'ready' };

    if (error) { response.error = error; }

    return response;
  }

  register(variables: any) {
    this.calls.push([variables]);
  }

// sinon mock interface
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
    return this.calls.some(([vars]) => deepEqual(vars, variables));
  }

  calledOnceWith(variables: any) {
    return this.calls.filter(([vars]) => deepEqual(vars, variables)).length === 1;
  }
}
