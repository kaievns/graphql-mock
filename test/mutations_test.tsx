import * as React from 'react';
import { Mutation } from 'react-apollo';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import { mock, render, expect } from './helper';
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

const MutatorComponent = () => (
  <Mutation mutation={mutation} onError={noop}>
    {(createItem, { data, loading, error }: any) => {
      if (loading) {
        return <div>Loading...</div>;
      }
      if (error) {
        return <div>{error.message}</div>;
      }
      if (data) {
        return <div id={data.createItem.id}>{data.createItem.name}</div>;
      }

      const onClick = () => createItem({ variables: { name: 'new item' } });

      return <button onClick={onClick}>click me</button>;
    }}
  </Mutation>
);

const HookedMutatorComponent = () => {
  const [response, setResponse] = React.useState({ data: null, loading: false, error: null });
  const [createItem] = useMutation(mutation);
  const onClick = () =>
    createItem({ variables: { name: 'new item' } })
      .then(result => setResponse(result as any))
      .catch(error => setResponse({ data: null, loading: false, error }));

  const { data, loading, error } = response;

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  if (data) {
    return <div id={data.createItem.id}>{data.createItem.name}</div>;
  }

  return <button onClick={onClick}>click me</button>;
};

describe('mutations', () => {
  describe('wrapped mutation component', () => {
    it('allows to mock mutation queries', () => {
      mock.expect(mutation).reply({
        createItem: { id: 1, name: 'new item' },
      });

      const wrapper = render(<MutatorComponent />);
      expect(wrapper.html()).to.eql('<button>click me</button>');

      wrapper.find('button').simulate('click');
      expect(wrapper.html()).to.eql('<div id="1">new item</div>');
    });

    it('allows to specify a failure response', () => {
      mock.expect(mutation).fail('everything is terrible');

      const wrapper = render(<MutatorComponent />);
      wrapper.find('button').simulate('click');

      expect(wrapper.html()).to.eql('<div>GraphQL error: everything is terrible</div>');
    });

    it('allows to test the mutation loading state', () => {
      mock
        .expect(mutation)
        .loading(true)
        .reply({ createItem: {} });

      const wrapper = render(<MutatorComponent />);
      wrapper.find('button').simulate('click');

      expect(wrapper.html()).to.eql('<div>Loading...</div>');
    });

    it('registers mutation calls in the history', () => {
      mock.expect(mutation).reply({
        createItem: { id: 1, name: 'new item' },
      });

      const wrapper = render(<MutatorComponent />);
      wrapper.find('button').simulate('click');

      expect(mock.history.requests).to.eql([
        {
          mutation: normalize(mutation),
          variables: { name: 'new item' },
        },
      ]);
    });

    it('allows to verify the exact variables that the mutation has been called with', () => {
      const mut = mock.expect(mutation).reply({
        createItem: { id: 1, name: 'new item' },
      });

      const wrapper = render(<MutatorComponent />);
      wrapper.find('button').simulate('click');

      expect(mut.calls).to.eql([[{ name: 'new item' }]]);
    });
  });

  describe('Hooked mutation component', () => {
    const sleep = () => new Promise(r => setTimeout(r, 10));

    it('allows to mock mutation queries', async () => {
      mock.expect(mutation).reply({
        createItem: { id: 1, name: 'new item' },
      });

      const wrapper = render(<HookedMutatorComponent />);
      expect(wrapper.html()).to.eql('<button>click me</button>');

      wrapper.find('button').simulate('click');
      await sleep();
      wrapper.update();

      expect(wrapper.html()).to.eql('<div id="1">new item</div>');
    });

    it('allows to specify a failure response', async () => {
      mock.expect(mutation).fail('everything is terrible');

      const wrapper = render(<HookedMutatorComponent />);
      wrapper.find('button').simulate('click');
      await sleep();
      wrapper.update();

      expect(wrapper.html()).to.eql('<div>GraphQL error: everything is terrible</div>');
    });

    it('allows to test the mutation loading state', async () => {
      mock
        .expect(mutation)
        .loading(true)
        .reply({ createItem: {} });

      const wrapper = render(<HookedMutatorComponent />);
      wrapper.find('button').simulate('click');
      await sleep();
      wrapper.update();

      expect(wrapper.html()).to.eql('<div>Loading...</div>');
    });

    it('registers mutation calls in the history', async () => {
      mock.expect(mutation).reply({
        createItem: { id: 1, name: 'new item' },
      });

      const wrapper = render(<HookedMutatorComponent />);
      wrapper.find('button').simulate('click');
      await sleep();
      wrapper.update();

      expect(mock.history.requests).to.eql([
        {
          mutation: normalize(mutation),
          variables: { name: 'new item' },
        },
      ]);
    });

    it('allows to verify the exact variables that the mutation has been called with', async () => {
      const mut = mock.expect(mutation).reply({
        createItem: { id: 1, name: 'new item' },
      });

      const wrapper = render(<HookedMutatorComponent />);
      wrapper.find('button').simulate('click');
      await sleep();
      wrapper.update();

      expect(mut.calls).to.eql([[{ name: 'new item' }]]);
    });
  });
});
