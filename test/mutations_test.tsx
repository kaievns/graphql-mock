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

const noop = () => null; // silence errors

const MutatorComponent = () =>
  <Mutation mutation={mutation} onError={noop}>
    {(createItem, { data, loading, error }: any) => {
      if (loading) { return <div>Loading...</div>; }
      if (error) { return <div>{error.message}</div>; }
      if (data) { return <div id={data.createItem.id}>{data.createItem.name}</div>; }

      const onClick = () => createItem({ variables: { name: 'new item' } });

      return <button onClick={onClick}>click me</button>;
    }}
  </Mutation>;

describe('mutation queries', () => {
  it('allows to mock mutation queries', () => {
    mock.expect(mutation).reply({
      createItem: { id: 1, name: 'new item' }
    });

    const wrapper = render(<MutatorComponent />);
    expect(wrapper.html()).toEqual('<button>click me</button>');

    wrapper.find('button').simulate('click');
    expect(wrapper.html()).toEqual('<div id="1">new item</div>'); 
  });

  it('allows to specify a failure response', () => {
    mock.expect(mutation).fail('everything is terrible');

    const wrapper = render(<MutatorComponent />);
    wrapper.find('button').simulate('click');

    expect(wrapper.html()).toEqual('<div>GraphQL error: everything is terrible</div>');
  });

  it('allows to test the mutation loading state', () => {
    mock.expect(mutation).loading(true).reply({ createItem: {} });

    const wrapper = render(<MutatorComponent />);
    wrapper.find('button').simulate('click');

    expect(wrapper.html()).toEqual('<div>Loading...</div>');
  });
});
