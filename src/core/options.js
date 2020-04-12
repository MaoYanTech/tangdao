import { createHashHistory } from 'history';
import { isFunction, isPlainObject, isArray } from '../utils'

export const initOptions = {
  history: null, // object 指定给路由用的 history，默认是 hashHistory
  initialState: {}, // object 指定初始数据，优先级高于 model 中的 state，默认是 {}
  onError: null, // function effect 执行错误或 subscription 通过 done 主动抛错时触发，可用于管理全局出错状态 ！
  onStateChange: null, // function state 改变时触发，可用于同步 state 到 localStorage，服务器端等。！
  wrapReducer: null, // function 封装 reducer 执行。比如借助 redux-undo 实现 redo/undo
  extraReducers: null, // object 指定额外的 reducer，比如 redux-form 需要指定额外的 form reducer
  extraEnhancers: [], // array 指定额外的 StoreEnhancer ，比如结合 redux-persist 的使用
  extraMiddleware: [], // array 用于注册 redux 中间件。支持函数或函数数组格式。
  extraSagas: [], // array 添加额外的 saga
  effectHooks: [], // array saga 副作用的钩子函数, 外部传参为 object
  effectThunk: true, // 是否开启异步 action 返回 promise
  updateState: null // function 用于自动创建的 reducer 进行 state 的更新
}

const mergeFiled = {};

// 函数类型的配置项不做合并，直接走覆盖
mergeFiled.updateState =
  mergeFiled.onError =
  mergeFiled.onStateChange =
  mergeFiled.wrapReducer = function (child, parent, key) {
    if (child && !isFunction(child)) {
      throw new Error(`${key} 应为 Function类型`);
    }
    return !child ? parent : child;
  }

// object 类型的配置需要走覆盖合并
mergeFiled.history = function(child, parent, key) {
  parent = parent ? parent : initOptions[key];
  if (child && !isPlainObject(child)) {
    throw new Error(`${key} 应为 plainObject 类型`);
  }
  return !child ? createHashHistory() : child;
};

mergeFiled.extraReducers =
  mergeFiled.initialState = function (child, parent, key) {
    parent = parent ? parent : initOptions[key];
    if (child && !isPlainObject(child)) {
      throw new Error(`${key} 应为 plainObject 类型`);
    }
    return !child ? parent : {
      ...parent,
      ...child
    };
  }

// array 类型的需要合并，但不覆盖
mergeFiled.effectHooks =
  mergeFiled.extraSagas =
  mergeFiled.extraEnhancers = function (child, parent, key) {
    parent = parent ? parent : initOptions[key];
    if (child && !isArray(child)) {
      throw new Error(`${key} 应为 Array 类型`);
    }
    return !child ? parent : parent.concat(child);
  }

  mergeFiled.extraMiddleware = function(child, parent, key) {
    parent = parent ? parent : initOptions[key];
    if (!child) {
      return parent;
    } else if (!(isFunction(child) || isArray(child))) {
      throw new Error(`${key} 接收到 ${typeof extraMiddleware}, 但是期望数据格式为数组和对象`);
    } else if (isFunction(child) && isFunction(parent)) {
      throw new Error(`extraMiddleware 配置错误，不可配置多个函数形式的 extraMiddleware`);
    } else if (isArray(child) && isArray(parent)) {
      return !child ? parent : parent.concat(child);
    } else if (isArray(child) && isFunction(parent)) {
      return function() {
        return child.concat(parent.apply(this, arguments));
      };
    } else if (isFunction(child) && isArray(parent)) {
      return function() {
        return child.apply(this, arguments).concat(parent);
      };
    }
  }

/**
 * 按照一定规则合并配置
 */
export function mergeOptions(child, parent) {
  Object.keys(child).forEach(key => {
    const childValue = child[key];
    const parentValue = parent[key];
    const handler = mergeFiled[key];
    if (isFunction(handler)) {
      parent[key] = handler(childValue, parentValue, key);
    } else {
      parent[key] = childValue;
    }
  });
  return parent;
}

/**
 * 对 effectHooks 做一个变形,
 * 将所有的 effectHooks 按照 start 和 end 合并到统一的 start 和 end 函数中执行
 */
export function handleEffectHooksOptions(options) {
  const { effectHooks } = options;
  const start = [];
  const end = [];
  const hookSum = {};
  if (effectHooks.length === 0) {
    return;
  }
  // 拿到 effectHooks 所有的 start 和 end
  effectHooks.forEach(hook => {
    hook.start && start.push(hook.start);
    hook.end && end.push(hook.end);
  });
  // 定义新的 start 函数
  if (start.length !== 0) {
    hookSum.start = function* (...args) {
      for (let i = 0, len = start.length; i < len; i++) {
        yield start[i](...args);
      }
    }
  }
  // 定义新的 end 函数
  if (end.length !== 0) {
    hookSum.end = function* (...args) {
      for (let i = 0, len = end.length; i < len; i++) {
        yield end[i](...args);
      }
    }
  }
  options.effectHooks = hookSum;
}

/**
 * 全局的错误处理函数，内含 app.$options.onError，
 * 可以通过配置 options 的 onError，处理错误报警
 */
export const onError = (app) => {
  return (err, extension) => {
    if (err) {
      if (typeof err === 'string') err = new Error(err);
      err.preventDefault = () => {
        err._dontReject = true;
      };
      if (app.$options.onError) {
        app.$options.onError(err, app.store.dispatch, extension);
      } else {
        throw new Error(err.stack || err);
      }
    }
  }
};