import History from '../src/history';
import { parse } from '../src/utils';
import { expect } from './helper';

const query = parse(`
  query TodoDos {
    todos {
      id
      name
    }
  }
`);

const mutation = parse(`
  mutation CreateTodo($name: String!) {
    createToDo(name: $name) {
      id
      name
    }
  }
`);

describe('History', () => {
  let history;
  beforeEach(() => history = new History());

  it('initializes with an empty list of requests', () => {
    expect(history.requests).to.have.length(0);
  });

  it('allows to register new requests', () => {
    history.register({ query });

    expect(history.requests).to.eql([
      {
        query: 'query TodoDos {\n  todos {\n    id\n    name\n  }\n}\n' 
      }
    ]);
  });

  it('allows to register mutations too', () => {
    history.register({ mutation, variables: { name: 'New entry' } });

    expect(history.requests).to.eql([
      {
        mutation: `mutation CreateTodo($name: String!) {\n  createToDo(name: $name) {\n    id\n    name\n  }\n}\n`,
        variables: { name: 'New entry' }
      }
    ]);
  });
});
