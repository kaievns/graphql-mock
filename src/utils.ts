import * as parser from 'graphql/language/parser';
import * as printer from 'graphql/language/printer';

export const parse = parser.parse;
export const stringify = printer.print;
export const normalize = (query: string) => stringify(parse(query));

// TODO: make a more serious implementation of this
export const fillIn = (query: string, variables: any = {}) => {
  let fullQuery = `${query}`;

  Object.keys(variables).forEach(key => {
    fullQuery = fullQuery.replace(`$${key}`, JSON.stringify(variables[key]));
  });

  return fullQuery;
};
