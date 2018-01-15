import * as parser from 'graphql/language/parser';
import * as printer from 'graphql/language/printer';

export const stringify = (query: object) => printer.print(query).trim();
export const parse = parser.parse;
export const normalize = (query: string) => stringify(parse(query));
