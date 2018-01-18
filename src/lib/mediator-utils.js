import _ from 'lodash';

export function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function guidGenerator() {
  return (S4() + S4() + '-' + S4() + '-' + S4()
    + '-' + S4() + '-' + S4() + S4() + S4());
}

export function concatNamespace(...namespaces) {
  return _.compact(namespaces).join(':');
}