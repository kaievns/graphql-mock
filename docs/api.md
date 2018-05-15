# API Documentation

A `GraphqlMock` instance provides the following methods/properties

---

`#expect(...).reply(...)` used for specifying regular responses and can be
called in the folloing ways:

1. `mock.expect(query/mutation).reply(...)` - in this case the mock will trigger
  the reseponse for _any_ query / variables combination
2. `mock.expect({ query } or { mutation })` - the same as above
3. `mock.expect({ query, variables } or { mutation, variables })` - in this case 
    the mock will trigger for this specific comibination of query and variables 
    _only_!

The query itself can be either a string or a `GraphQLQuery` object. You can
either declare them anew in the tests (formatting doesn't matter) or re-use
queries declared in your source code:

---

`#expect(...).fail(...) used to make specific queries/mutations to fail. the
query/mutation/variables options are the same as above. The failure should be
either a string, or an `ApolloError` instance.

---

`#client` is a reference to the underline ApolloClient instance, which you
should pass into `ApolloProvider` in your testing setup

---

`#reset()` will reset all the mocks and queries history

---

`#history` provides access to the history of all the queries and mutations (along
with corresponding variables) that happened recently. In case you need to assert
that specific queries did in fact happen

---

`#allowUnmockedRequests(state)` -> switch on/off an option to allow unmocked queries to fall through
