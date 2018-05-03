import { ApolloError } from 'apollo-client';
import { normalize } from './utils';

export interface Mock {
  query: string;
  count: number;
  data: any;
  error?: any;
  loading: boolean;
}

export default class Expectations {
  mocks: Mock[] = [];

  reset() {
    this.mocks = [];
  }

  expect(query: string, count = 1) {
    this.mocks.push({ query: normalize(query), count, data: {}, loading: false });
    return this;
  }

  times(count: number) {
    const lastEntry = this.mocks[this.mocks.length - 1];
    lastEntry.count = count;
    return this;
  } 

  reply(data: any) {
    // TODO: add the mock time schema validation for the mock data
    const lastEntry = this.mocks[this.mocks.length - 1];
    lastEntry.data = data;
    return this;
  }

  fail(error: any | any[] | string) {
    const lastEntry = this.mocks[this.mocks.length - 1];
    const errors = typeof error === 'string' ? [{ message: error }] : error;

    lastEntry.error = error instanceof ApolloError ? error : new ApolloError({
      graphQLErrors: Array.isArray(errors) ? errors : [errors]
    });

    return this;
  }

  loading(value = true) {
    const lastEntry = this.mocks[this.mocks.length - 1];
    lastEntry.loading = value;
    return this;
  }

  forQuery(query: string): any | void {
    const normalizedQuery = normalize(query);
    const entry = this.mocks.find(({ query }) => query === normalizedQuery);
    const { data, error, loading } = entry || {} as Mock;

    return entry ? { data, error, loading, networkStatus: error ? 'error' : 'ready' } : undefined;
  }
}
