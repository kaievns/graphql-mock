import { deepEqual } from './utils';

export interface Constructor {
  query: string;
  data?: any;
  error?: any;
  loading?: boolean;
}

export default class Mock {
  query: string;
  calls: any[];
  data: any;
  error?: any;
  loading: boolean;

  constructor({ query, data = {}, error, loading = false }: Constructor) {
    this.query = query;
    this.data = data;
    this.error = error;
    this.loading = loading;
    this.calls = [];
  }

  register(call: any) {
    this.calls.push(call);
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
