import * as React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { mock, render } from './helper';
import { normalize } from '../src/utils';

const mutation = gql`
  mutation GetItems($name: String!) {
    createItem(name: $name) {
      id
      name
    }
  }
`;

const MutatorComponent = () =>
  <Mutation mutation={mutation}>
    {(createItem, { data, loading, error }: any) => {
      if (loading) { return <div>Loading...</div>; }
      if (error) { return <div>{error.message}</div>; }
      if (data) { return <div id={data.createItem.id}>{data.createItem.name}</div>; }

      const onClick = () => createItem({ variables: { name: 'new item' } });

      return <button onClick={onClick}>click me</button>;
    }}
  </Mutation>;

describe('mutation queries', () => {
  it('allows to mock mutation queries', async () => {
    const req = mock.expect(mutation).reply({
      createItem: { id: 1, name: 'new item' }
    });

    const wrapper = render(<MutatorComponent />);
    expect(wrapper.html()).toEqual('<button>click me</button>');

    wrapper.find('button').simulate('click');

    expect(wrapper.html()).toEqual('<div>Loading...</div>');

    await new Promise(r => setTimeout(r, 50)); // waiting for the response to be passed back in

    expect(wrapper.html()).toEqual('<div id="1">new item</div>'); 
  });
});
