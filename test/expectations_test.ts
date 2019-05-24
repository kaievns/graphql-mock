import Mock from '../src/mock';
import Expectations from '../src/expectations';
import { normalize, parse } from '../src/utils';
import { expect } from './helper';

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

describe('Expectations', () => {
  let expectations;
  beforeEach(() => (expectations = new Expectations()));

  it('starts with an empty list of mocks', () => {
    expect(expectations.mocks).to.eql([]);
  });

  describe('expect(query)', () => {
    it('allows to create a basic query expectation', () => {
      const mock = expectations.expect(query);

      expect(mock).to.be.instanceOf(Mock);
      expect(mock).to.eql(new Mock({ query: normalize(query) }));
    });

    it('allows to specify query as an object', () => {
      const mock = expectations.expect({ query });
      expect(mock).to.eql(new Mock({ query: normalize(query) }));
    });

    it('accepts a GraphQLQuery object', () => {
      const mock = expectations.expect(parse(query));
      expect(mock).to.eql(new Mock({ query: normalize(query) }));
    });

    it('accepts appolo query with a graphql query object', () => {
      const mock = expectations.expect({ query: parse(query) });
      expect(mock).to.eql(new Mock({ query: normalize(query) }));
    });

    it('accepts queries with variables', () => {
      const variables = { a: 1, b: 2 };
      const mock = expectations.expect({ query, variables });
      expect(mock).to.eql(new Mock({ query: normalize(query), variables }));
    });

    it('accepts mutations as well', () => {
      const mock = expectations.expect(mutation);
      expect(mock).to.eql(new Mock({ query: normalize(mutation) }));
    });

    it('accepts mutations + variables sets too', () => {
      const variables = { a: 1, b: 2 };
      const mock = expectations.expect({ mutation, variables });
      expect(mock).to.eql(new Mock({ query: normalize(mutation), variables }));
    });
  });

  describe('#findMockResponseFor', () => {
    const request = {
      query: normalize(query),
      variables: { a: 1 },
    };

    it('returns null if there is no mocks', () => {
      expect(expectations.findMockResponseFor(request)).to.equal(null);
    });

    it('returns null of no matching query is mocked', () => {
      expectations.expect(mutation);
      expect(expectations.findMockResponseFor(request)).to.equal(null);
    });

    it('finds a mock response if there is a matching query mock', () => {
      const mock = expectations.expect(query);
      expect(expectations.findMockResponseFor(request)).to.eql(mock.response);
    });

    it('returns the same response for any variables if only query was specified', () => {
      const mock = expectations.expect(query);
      const resp1 = expectations.findMockResponseFor({ ...request, variables: { a: 1 } });
      const resp2 = expectations.findMockResponseFor({ ...request, variables: { b: 2 } });

      expect(resp1).to.eql(mock.response);
      expect(resp2).to.eql(mock.response);
    });

    it('matches only specific pair if both query and variables were mocked', () => {
      const mock = expectations.expect({ query, variables: { b: 2 } });

      const resp1 = expectations.findMockResponseFor({ ...request, variables: { a: 1 } });
      const resp2 = expectations.findMockResponseFor({ ...request, variables: { b: 2 } });

      expect(resp1).to.equal(null);
      expect(resp2).to.eql(mock.response);
    });

    it('works with mutation mocks as well', () => {
      const mock = expectations.expect(mutation);
      const response = expectations.findMockResponseFor({
        mutation: normalize(mutation),
        variables: { b: 2 },
      });

      expect(response).to.eql(mock.response);
    });
  });
});
