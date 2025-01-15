export * from './classes';
export * from './decorators';
export * from './functions';
export * from './interface';
export * from './managers';
export * from './types';

import * as classes from './classes';
import * as decorators from './decorators';
import * as functions from './functions';
import * as interfaceNqtr from './interface';
import * as managers from './managers';
import * as types from './types';

const nqtr = {
    ...classes,
    ...decorators,
    ...functions,
    ...interfaceNqtr,
    ...managers,
    ...types,
};
export default nqtr

