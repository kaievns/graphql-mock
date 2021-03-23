import * as React from 'react';
import { ApolloClient } from 'apollo-client';
import { mock, render, expect } from './helper';
import { QueryComponent, query } from './query_test';
import History from '../src/history';

describe('GraphqlMock', () => {
  it('provides access to the mocked client', () => {
    expect(mock.client).to.be.instanceOf(ApolloClient);
  });

  it('provides access to the history object', () => {
    expect(mock.history).to.be.instanceOf(History);
  });

  it('resolves when query is mocked correctly', () => {
    mock.expect(query).reply({
      items: [{ id: '1', name: 'one' }, { id: '2', name: 'two' }],
    });

    const wrapper = render(<QueryComponent />);

    expect(wrapper.html()).to.eql('<ul><li>one</li><li>two</li></ul>');
  });

  it('explodes when query does not have an appropriate mock', () => {
    expect(() => {
      render(<QueryComponent />);
    }).to.throw(
      'Unexpected GraphQL request:\nquery GetItems {\n  items {\n    id\n    name\n  }\n}\n'
    );
  });

  it('does not explode if one allows for requests to fall through', () => {
    mock.allowUnmockedRequests();

    const wrapper = render(<QueryComponent />);

    expect(wrapper.html()).to.contain('<div>Loading...</div>');

    mock.allowUnmockedRequests(false);
  });
});
