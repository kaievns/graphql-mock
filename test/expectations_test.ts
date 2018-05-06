import Mock from '../src/mock';
import Expectations from '../src/expectations';
import { normalize, parse } from '../src/utils';

const query = `
  query Todos {
    todos {
      id
      name
    }
  }
`;

const mutation = `
  mutation CreateTodo($name: String!) {
    createTodo(name: $name) {
      id
      name
    }
  }
`;

describe(Expectations, () => {
  let expectations;
  beforeEach(() => expectations = new Expectations());

  it('starts with an empty list of mocks', () => {
    expect(expectations.mocks).toEqual([]);
  });

  describe('expect(query)', () => {
    it('allows to create a basic query expectation', () => {
      const mock = expectations.expect(query);
      
      expect(mock).toBeInstanceOf(Mock);
      expect(mock).toEqual(new Mock({ query: normalize(query) }));
    });

    it('allows to specify query as an object', () => {
      const mock = expectations.expect({ query });
      expect(mock).toEqual(new Mock({ query: normalize(query) }));
    });

    it('accepts a GraphQLQuery object', () => {
      const mock = expectations.expect(parse(query));
      expect(mock).toEqual(new Mock({ query: normalize(query) }));
    });

    it('accepts appolo query with a graphql query object', () => {
      const mock = expectations.expect({ query: parse(query) });
      expect(mock).toEqual(new Mock({ query: normalize(query) }));
    });

    it('accepts queries with variables', () => {
      const variables = { a: 1, b: 2 };
      const mock = expectations.expect({ query, variables });
      expect(mock).toEqual(new Mock({ query: normalize(query), variables }));
    });

    it('accepts mutations as well', () => {
      const mock = expectations.expect(mutation);
      expect(mock).toEqual(new Mock({ query: normalize(mutation) }));
    });

    it('accepts mutations + variables sets too', () => {
      const variables = { a: 1, b: 2 };
      const mock = expectations.expect({ mutation, variables });
      expect(mock).toEqual(new Mock({ query: normalize(mutation), variables }));
    });
  });
});
