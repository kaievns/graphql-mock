import * as parser from 'graphql/language/parser';
import * as printer from 'graphql/language/printer';
import * as fastDeepEqual from 'fast-deep-equal';

export const { parse } = parser;
export const stringify = printer.print;
export const normalize = (query: string | object) => {
  const queryObject = typeof query === 'string' ? parse(query) : query;
  return stringify(queryObject as any);
};

// TODO: make a more serious implementation of this
export const fillIn = (query: string, variables: any = {}) => {
  let fullQuery = `${query}`;

  Object.keys(variables).forEach(key => {
    fullQuery = fullQuery.replace(`: $${key}`, `: ${JSON.stringify(variables[key])}`);
  });

  return fullQuery;
};

export const deepEqual = fastDeepEqual;
