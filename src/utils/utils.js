export function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
export const isArray = Array.isArray.bind(Array);
export const isFunction = o => typeof o === 'function';
export const isString = str => typeof str === 'string';
export const isHTMLElement = node => typeof node === 'object' && node !== null && node.nodeType && node.nodeName;
export const isNumber = num => num === num && !isNaN(num);
export const noop = () => {};
export const findIndex = (array, predicate) => {
  for (let i = 0, { length } = array; i < length; i += 1) {
    if (predicate(array[i], i)) return i;
  }
  return -1;
};
export const getObjLen = obj => Object.keys(obj).length;
export function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}
export const inBrowser = typeof window !== 'undefined';
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isIE = UA && /msie|trident/.test(UA);
export function sleep(delay) {
  return new Promise( resolve => {
    setTimeout(() => {
      resolve();
    }, delay)
  })
}

export const isGlobalType = (nameType) => {
  return /^\${2}/.test(nameType)
};
export const toCamelCase = str => {
  const pattern = /-([a-z])/g
  return str.replace(pattern,function(all,letter){
    return letter.toUpperCase();
  })
}