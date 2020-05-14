import invariant from 'invariant';
import { isArray, isFunction, isString, isGlobalType } from '../../utils';
import { getApp } from '../create';

export const NAMESPACE_SEP = '/';

let SEP = NAMESPACE_SEP;

function prefix(obj, namespace, type, reversal) {
  return Object.keys(obj).reduce((memo, key) => {
    invariant(
      key.indexOf(`${namespace}${SEP}`) !== 0,
      `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`
    );
    invariant(
      key.indexOf('/effect/') !== 0,
      `[prefixNamespace]: ${type} ${key} 不应包含 /effect/ 关键词`
    );
    let value = obj[key];
    let newKey = `${namespace}${SEP}`;

    // 全局公用 actionType 不需要进行全局唯一
    if (isGlobalType(key)) {
      newKey = '';
      key = key.split('$$')[1];
    }

    if (isGlobalType(value)) {
      newKey = '';
      value = value.split('$$')[1];
    }

    if (reversal) {
      newKey += value;
      memo[value] = newKey;
    } else {
      newKey += key;
      memo[newKey] = value;
    }
    return memo;
  }, {});
}

function prefixGlobalType(model, app) {
  const actionType = {};
  const globalModels = app.globalModels;
  Object.keys(model).forEach( key => {
    if (key !== 'namespace' && key !== 'init') { // 收集 actionType
      const val = model[key];
      invariant(isString(val), '公用 actionType 只能为字符串类型');
      invariant(!globalModels[val], `${model.namespace} 下的 ${key} 冲突，请保持公用 actionType 唯一`);
      actionType[key] = model[key];
      globalModels[val] = val;
    }
  });
  return actionType;
}

/**
 * 为 model 中的 reducers、effects 添加 ${namespace}/
 * @param {Object} model
 */
export function setNamespace(model, app) {
  const { namespace, reducers, effects } = model;
  // 创建 actionType
  let actionTypes = {};
  // 创建全局公用 actionType
  if (isGlobalType(model.namespace)) {
    actionTypes = prefixGlobalType(model, app);
  }

  if (reducers) {
    // 管理 actionType
    actionTypes = prefix(Object.keys(reducers), namespace, 'actionTypes', true);
    model.reducerTypes = Object.keys(actionTypes);
    if (isArray(reducers)) {
      model.reducers[0] = prefix(reducers[0], namespace, 'reducer');
    } else {
      model.reducers = prefix(reducers, namespace, 'reducer');
    }
  }

  if (effects) {
    SEP = '/effect/' // 添加副作用标示
    actionTypes = {
      ...actionTypes,
      ...prefix(Object.keys(effects), namespace, 'actionTypes', true)
    }
    model.effects = prefix(effects, namespace, 'effect');
    SEP = NAMESPACE_SEP; // 处理完之后，重置为全局 SEP
  }

  // 创建 actionCreator
  const actionCreator = {};
  Object.keys(actionTypes).forEach(key => {
    const namespacedActionType = actionTypes[key];
    actionCreator[key] = function (payload, fn) { // payload 支持多参，单参传递
      if (arguments.length === 1 && isFunction(arguments[0])) {
        payload = undefined;
        fn = arguments[0];
      }
      let res = {
        type: namespacedActionType,
        payload
      };
      // 只对 effects 下做 fn 的回调
      if (isFunction(fn) && model.reducerTypes.indexOf(key) === -1) {
        res.callback = function() { // 返回当前状态树和对应 model 的状态
          const state = getApp().store.getState();
          const modelState = state[namespace];
          fn(state, modelState);
        };
      }
      return res;
    }
  })

  model.actionCreator = actionCreator;
  model.actionTypes = actionTypes;
  return model;
}