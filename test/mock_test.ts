import Mock from '../src/mock';

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
      expect(mock.calls).toEqual([{ a: 1 }]);
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
