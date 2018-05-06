import Mock from '../src/mock';
import { ApolloError } from 'apollo-client';
import { GraphQLError } from 'graphql';

const query = `
  some query
`;

describe('Mock', () => {
  let mock;
  beforeEach(() => mock = new Mock({ query }));

  it('starts with an empty list of calls', () => {
    expect(mock.calls).toHaveLength(0);
  });

  describe('#register(call)', () => {
    it('adds a call into the history', () => {
      mock.register({ a: 1 });
      expect(mock.calls).toEqual([[{ a: 1 }]]);
    });
  });

  describe('#reply(data)', () => {
    it('saves the data on the mock', () => {
      const data = { a: 1, b: 2 };
      mock.reply(data);
      expect(mock.results.data).toBe(data);
    });

    it('returns the mock self reference back', () => {
      const result = mock.reply({ a: 1 });
      expect(result).toBe(mock);
    });
  });

  describe('#fail(error)', () => {
    it('accepts regular strings as error messages', () => {
      mock.fail('everything is terrible');
      expect(mock.results.error).toEqual(new ApolloError({
        graphQLErrors: [new GraphQLError('everything is terrible')]
      }));
    });

    it('accepts an array of objects as errors', () => {
      mock.fail([
        { message: 'everything is terrible' },
        { message: 'absolutely awful' }
      ]);
      expect(mock.results.error).toEqual(new ApolloError({
        graphQLErrors: [
          new GraphQLError('everything is terrible'),
          new GraphQLError('absolutely awful')
        ]
      }));
    });

    it('accepts apollo errors as errors too', () => {
      const error = new ApolloError({
        graphQLErrors: [new GraphQLError('everything is terrible')]
      });
      mock.fail(error);
      expect(mock.results.error).toBe(error);
    });

    it('returns a self reference', () => {
      const result = mock.fail('everything is terrible');
      expect(result).toBe(mock);
    });
  });

  describe('#loading()', () => {
    it('switches the loading state to true by default', () => {
      mock.loading();
      expect(mock.results.loading).toBe(true);
    });

    it('allows to switch loading state off', () => {
      mock.results.loading = true;
      mock.loading(false);
      expect(mock.results.loading).toBe(false);
    });

    it('returns a self reference', () => {
      const result = mock.loading();
      expect(result).toBe(mock);
    });
  });

  describe('#response', () => {
    it('returns correct data/loading/networkStatus for a regular mock', () => {
      const mock = new Mock({ query, data: { a: 1 } });
      expect(mock.response).toEqual({
        data: { a: 1 },
        loading: false,
        networkStatus: 'ready'
      });
    });

    it('returns correct data for an error as well', () => {
      const error = new ApolloError({
        graphQLErrors: [new GraphQLError('everything is terrible')]
      });
      const mock = new Mock({ query, error });
      expect(mock.response).toEqual({
        data: {},
        error,
        loading: false,
        networkStatus: 'error'
      });
    });
  });

  describe('sinon compatible interface', () => {
    it('provides access to callCount', () => {
      expect(mock.callCount).toEqual(0);
      mock.register({});
      expect(mock.callCount).toEqual(1);
    });

    it('checks whether the mock was not ever called', () => {
      expect(mock.notCalled).toBe(true);
      mock.register({});
      expect(mock.notCalled).toBe(false);
    });

    it('checks whether the mock was called', () => {
      expect(mock.called).toBe(false);
      mock.register({});
      expect(mock.called).toBe(true);
    });

    it('checks whether the mock was called just once', () => {
      expect(mock.calledOnce).toBe(false);
      mock.register({});
      expect(mock.calledOnce).toBe(true);
      mock.register({});
      expect(mock.calledOnce).toBe(false);
    });

    it('checks if the mock was called with specific variables', () => {
      expect(mock.calledWith({ one: 1 })).toBe(false);
      mock.register({ two: 2 });
      expect(mock.calledWith({ one: 1 })).toBe(false);
      mock.register({ one: 1 });
      expect(mock.calledWith({ one: 1 })).toBe(true);
    });

    it('checks if the mock was called only once with the variables', () => {
      expect(mock.calledOnceWith({ one: 1 })).toBe(false);
      mock.register({ two: 2 });
      expect(mock.calledOnceWith({ one: 1 })).toBe(false);
      mock.register({ one: 1 });
      expect(mock.calledOnceWith({ one: 1 })).toBe(true);
      mock.register({ one: 1 });
      expect(mock.calledOnceWith({ one: 1 })).toBe(false);
    });
  });
});
