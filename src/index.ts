import * as nock from 'nock';
import { parse } from 'url';

export type Mock = (type: string) => object;

export interface Mocks {
  [key: string]: Mock;
}

export interface Options {
  uri: string;
  schema: string;
  mocks?: Mocks;
}

export default class GraphQLMock {
  public options: Options;
  public mock: nock.Scope;

  constructor(options: Options) {
    const { hostname, port, path } = parse(options.uri);

    this.options = options;

    this.mock = nock(hostname + port ? `:${port}` : '');
    this.mock.post(path).reply(200, () => {
      console.log(arguments);
    });
  }
}
