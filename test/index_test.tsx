import * as React from 'react';
import { render } from './helper';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

interface Item {
  id: string;
  name: string;
}

interface Props {
  data: {
    loading: boolean
    items?: Item[]
  };
}

const query = gql`
  query GetItems {
    items {
      id
      name
    }
  }
`;

const WrappedComponent = graphql<null, null, Props>(query)(
  ({ data: { items = [] } }: Props) => (
    <ul>
      {items.map(item => <li key={item.id} >{item.name}</li>)}
    </ul>
  )
);

describe('GraphQL wrapped component', () => {
  it('renders', () => {
    const wrapper = render(<WrappedComponent />);
    expect(wrapper.html()).toEqual(
      ``
    );
  });
});
