import * as React from 'react';
import { mock, render } from './helper';
import { QueryComponent } from './query_test';
import { ApolloClient } from 'apollo-client';
import History from '../src/history';

describe('GraphqlMock', () => {
  it('provides access to the mocked client', () => {
    expect(mock.client).toBeInstanceOf(ApolloClient);
  });

  it('provides access to the history object', () => {
    expect(mock.history).toBeInstanceOf(History);
  });

  it('explodes when query does not have an appropriate mock', () => {
    expect(() => {
      render(<QueryComponent />);
    }).toThrow('Unexpected GraphQL request:\nquery GetItems {\n  items {\n    id\n    name\n  }\n}\n');
  });

  it('does not explode if one allows for requests to fall through', () => {
    mock.allowUnmockedRequests();

    const wrapper = render(<QueryComponent />);

    expect(wrapper.html()).toContain('</ul>');

    mock.allowUnmockedRequests(false);
  });
});
