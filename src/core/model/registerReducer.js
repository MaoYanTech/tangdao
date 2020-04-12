import { isFunction, isPlainObject, toCamelCase } from '../../utils'

/**
 * 注册通用简单更新 state 的 reducer
 */
export const registerReducer = (model, updateState, stateToJS) => {
  const modelUpdateState = model.updateState;
  // 没有提供 updateState 函数，则不进行 reducer 的自动创建
  if (!updateState && !modelUpdateState) {
    return;
  }
  // 提供不为函数类型的 updateState，直接报错提示
  if (!!updateState && !isFunction(updateState)) {
    throw new Error('全局下的 updateState 应为函数类型');
  }
  if (!!modelUpdateState && !isFunction(modelUpdateState)) {
    throw new Error('model 内提供的 updateState 应为函数类型');
  }
  // model 内提供的 updateState 优先级高于全局
  const update = !!modelUpdateState ? modelUpdateState : updateState;
  let { state } = model;
  // model.state 不是对象类型的不进行 reducer 自动创建
  if (!isObject(state)) {
    return;
  }
  // state 非普通对象（eg: immutable）, 需要使用方提供转换成普通 js 对象的能力
  if (!isPlainObject(state) && !stateToJS && !isFunction(stateToJS)) {
    throw new Error('model state 非 plainObject, 为了更好的使用 updateState 功能，请在初始化时提供将其转换成普通对象的函数方法');
  }

  state = isPlainObject(state) ? state : stateToJS(state);

  if (model.reducers === undefined) {
    model.reducers = {};
  }
  const reducers = model.reducers;

  Object.keys(state).forEach(key => {
    const actionKey = toCamelCase(`set-${key}`);
    // 如果 model 下已经设置了该 state 的 reducer 则不为该 state 进行自动创建
    if (!reducers[actionKey]) {
      reducers[actionKey] = function(state, payload) {
        return update(state, key, payload);
      }
    }
  });
}

function isObject(target) {
  return Object.prototype.toString.call(target).slice(8, -1).toLowerCase() === 'object';
}