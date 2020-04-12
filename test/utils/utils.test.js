import {
  isPlainObject,
  getObjLen,
  isGlobalType,
  findIndex,
  isNative,
  isNumber,
  toCamelCase,
  sleep, isHTMLElement, noop
} from '../../src/utils';
describe('utils', () => {
  describe('isPlainObject', () => {
    it('plainObject', () => {
      expect(isPlainObject({})).toBe(true);
    });
    it('empty args', () => {
      expect(isPlainObject()).toBe(false);
    });
    it('no-plainObject', () => {
      function Obj() {
        return this;
      };
      expect(isPlainObject(new Obj())).toBe(false);
    })
  });
  describe('isGlobalType', () => {
    it('isGlobalType', () => {
      expect(isGlobalType('$$namespace')).toBe(true);
      expect(isGlobalType('$$$namespace')).toBe(true);
    });
    it('no-isGlobalType', () => {
      expect(isGlobalType('$namespace')).toBe(false);
      expect(isGlobalType('namespace')).toBe(false);
    });
  });
  describe('findIndex', () => {
    it('should return when no item match', () => {
      const array = [1, 2, 3];
      const action = i => i === 4;
      expect(findIndex(array, action)).toBe(-1);
    });
    it('should return 1 when item match', () => {
      const array = [1, 2, 3];
      const action = i => i === 2;
      expect(findIndex(array, action)).toBe(1);
    });
    it('should return the first match index if moer than one match', () => {
      const array = [1, 2, 3, 3, 3];
      const action = i => i === 3;
      expect(findIndex(array, action)).toBe(2);
    })
  });
  describe('isNumber', () => {
    it('should retuen true when args is number', () => {
      expect(isNumber(1)).toBe(true);
    });
    it('should retuen false when args is NaN', () => {
      expect(isNumber(NaN)).toBe(false);
    });
  });
it('method to camelCase', () => {
    const methods = ['a', '-a', 'a-ba', 'a--ba', 'a-ba-ca', 'a-ba-c'];
    expect(toCamelCase(methods[0])).toBe('a');
    expect(toCamelCase(methods[1])).toBe('A');
    expect(toCamelCase(methods[2])).toBe('aBa');
    expect(toCamelCase(methods[3])).toBe('a-Ba');
    expect(toCamelCase(methods[4])).toBe('aBaCa');
    expect(toCamelCase(methods[5])).toBe('aBaC');
  });
  it('sleep 2s', async () => {
    const before = Date.now();
    await sleep(2000);
    const diff = 2000 <= (Date.now() - before);
    expect(diff).toEqual(true);
  });
  it('get object`s length', () => {
    expect(getObjLen({})).toBe(0);
    expect(getObjLen({a: 1})).toBe(1);
  });
  it('api is native code', () => {
    expect(isNative(Promise)).toEqual(true)
  });
  it('is html element', () => {
    expect(isHTMLElement({nodeType: 1, nodeName: 'div'})).toBe('div');
    expect(isHTMLElement({nodeType: 1})).toEqual(undefined);
    expect(isHTMLElement(null)).toEqual(false);
  })
  it('noop', () => {
    expect(noop()).toEqual(undefined);
  })
})