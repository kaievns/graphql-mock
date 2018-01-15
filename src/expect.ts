import { normalize } from './utils';

export interface Mock {
  query: string;
  count: number;
  data?: any;
}

export default class Expectations {
  public mocks: Mock[] = [];

  public reset() {
    this.mocks = [];
  }

  public expect(query: string, count = 1) {
    this.mocks.push({ query: normalize(query), count });
    return this;
  }

  public times(count: number) {
    const lastEntry = this.mocks[this.mocks.length - 1];
    lastEntry.count = count;
    return this;
  } 

  public reply(data: any) {
    // TODO: add the mock time schema validation for the mock data
    const lastEntry = this.mocks[this.mocks.length - 1];
    lastEntry.data = data;
    return this;
  }

  public forQuery(query: string): any | void {
    const normalizedQuery = normalize(query);
    const entry = this.mocks.find(({ query }) => query === normalizedQuery);

    return entry ? entry.data : undefined;
  }
}
