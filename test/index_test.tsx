import { render, graphqlMock } from './helper';
import * as React from 'react';
import { graphql, Query, Mutation } from 'react-apollo';
import { ApolloError } from 'apollo-client';
import gql from 'graphql-tag';


describe.skip('graphqlMock', () => {
  beforeEach(() => graphqlMock.reset());


  describe('#mutations', () => {
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

    it('has an empty list of mutations by default', () => {
      expect(graphqlMock.mutations).toEqual([]);
    });

    it('allows to watch for the mutations', () => {
      const wrapper = render(<MutatorComponent />);
      wrapper.find('button').simulate('click');

      expect(graphqlMock.mutations).toEqual([
        'mutation GetItems($name: String!) {\n  createItem(name: \"new item\") {\n    id\n    name\n  }\n}\n'
      ]);
    });

    it('allows to read the last mutation called', () => {
      const wrapper = render(<MutatorComponent />);
      wrapper.find('button').simulate('click');

      expect(graphqlMock.lastMutation).toEqual(
        'mutation GetItems($name: String!) {\n  createItem(name: \"new item\") {\n    id\n    name\n  }\n}\n'
      );
    });
    
    it('allows to mock mutation responses', async () => {
      graphqlMock.expect(mutation).reply({
        createItem: {
          id: 1,
          name: 'new item'
        }
      });

      const wrapper = render(<MutatorComponent />);
      expect(wrapper.html()).toEqual('<button>click me</button>'); 

      wrapper.find('button').simulate('click');

      expect(wrapper.html()).toEqual('<div>Loading...</div>'); 

      await new Promise(r => setTimeout(r, 50)); // waiting for the response to be passed back in

      expect(wrapper.html()).toEqual('<div id="1">new item</div>'); 
    });
  });
});
