import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import invariant from 'invariant';
import { createHashHistory } from 'history';
import { getObjLen } from '../utils';
import { setNamespace, checkModel, registerReducer } from './model/index';
import createRedux, { createSaga, createReducer } from './create-redux';
import { isString, isHTMLElement, isFunction, isPlainObject, findIndex, isArray } from '../utils';
import actionCreators from './action-creators';
import { mergeOptions, initOptions, handleEffectHooksOptions, onError } from './options';
import { handleSubscriptions, unlistenSubscription, runSubscription } from './subscriptions';
import effectNextTick from './next-tick/effetct-next-tick';
import effectThunk from '../plugins/effect-thunk';

const $appGlobalName = Symbol.for(`$tangdao_app_${Date.now()}`); // create 创建 app 的全局变量

// tangdao 内部的 reducer
const tangdaoModel = {
  namespace: '@@tangdao',
  state: 0,
  reducers: {
    UPDATE(state) {
      return state + 1;
    }
  }
};

// 全局 model action 的自动派发
export let dispatch;

// 全局 model actionCreator 的获取
export let actionCreator;

// 全局 model actionType 的获取
export let actionType;

/**
 * 初始化 tangdao app ，初始化配置和返回相应的 api
 * @param {Object} config 用户传入的配置
 * @return app
 */
export function create(options) {
  // 对用户传入的配置进行合并
  options.history = options.history ? options.history : createHashHistory();
  options = mergeOptions(options, initOptions);
  const app = {
    el: null, // 挂载节点
    $options: options, // 配置信息
    $models: [], // 存放所有 model 的地方
    start: start, // 函数，通过调用 start 函数可以将组件挂载指定元素下
    model: model, // 函数，通过调用 model 函数可以传入相关数据流配置并创建 redux store
    batchModel: batchModel, // 函数，批量注册 model，只注册 model，不创建 redux store
    unmodel: unmodel, // 函数，用于卸载某个 model
    replaceModel: replaceModel, // 函数， 永远替换某个 model
    router: customRouter, // 函数，路由配置
    actionCreator: {}, // actionCreator 的管理
    actionTypes: {}, // actionType 的 namespace 管理
    autoDispatch: {}, // model 的 action 自动派发
    history: patchHistory(options.history),
    use: use, // 用于配置 hook
    getStore: getStore, // 在 app.start 之前获取 redux store
    injectModel: injectModel, // 在 start 后注入一个 model
    globalModels: {}, // 全局模块
    store: null // redux store
  }
  app.batchModel(tangdaoModel);
  // 挂载 effectThunk 插件
  options.effectThunk && app.use(effectThunk);
  app.use(effectNextTick);
  registerApp($appGlobalName, app);
  return app;
  /**
   * 将 app 注册到本地
   */
  function registerApp(globalName, app) {
    Object.defineProperty(window, $appGlobalName, {
      configurable: false,
      writable: false,
      value: app
    });
  }

  /**
   * 启动应用
   * @param {String} el 可选，如果没有 el 参数，会返回一个返回 JSX 元素的函数。
   */
  function start(el) {
    invariant(app.$router, `[app.start] router must be registered before app.start()`);
    let container = null;
    if (isString(el)) {
      container = document.querySelector(el);
    }
    invariant(container || isHTMLElement(container), `[app.start] container should be HTMLElement`);
    // 兼容之前的旧版本
    if (!app.store) {
      console.warn(`
        请按照 : \r\n 
        1、const app = tangdao(); \r\n 
        2、app.use(); \r\n 
        3、app.model(); \r\n 
        4、app.router(require("xxx"); \r\n 
        5、app.start("el") \r\n 
        顺序和规范执行唐刀的初始化, 否则将无法正常获取和使用 useModel、dispatch、actionType、actionCreator
      `);
      getStore();
    }
    app.el = container;
    if (container) {
      render();
    } else {
      return getProvider();
    }
  }

  /**
   * 在 app.start 前生成 redux store
   * @return redux store
   */
  function getStore() {
    if (app.store) {
      return app.store;
    }
    app.$options.$globalOnError = onError(app);
    const options = app.$options;
    // 将 effectHooks 由数组转换成 obj
    handleEffectHooksOptions(options);
    if (app.$models.length === 0 && getObjLen(options.extraReducers).length === 0) {
      throw new Error('在 app.start 之前执行 getStore 时，请确认传入有效 model 或者 extraReducers');
    }
    const store = createRedux(app);
    // 将 dispatch 挂载到全局
    dispatch = actionCreators(app.actionCreator, store.dispatch);
    // 将 actionType 挂载到全局
    actionType = app.actionTypes;
    // 将 actionCreator 挂载到全局
    actionCreator = app.actionCreator;

    app.autoDispatch = dispatch;
    app.store = store;
    // 处理 subscriptions
    app.$subscriptions = handleSubscriptions(app);
    return store;
  }

  /**
   * 在 start 执行前注册 model, 为其添加 ${namespace}/，会创建 redux store
   * @param {Object} model
   */
  function model(model) {
    if (!isArray(model)) {
      model = [model];
    }
    // 如果是分批注册 model,那么后期注册的 model 进行注入
    if (app.store) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('model 方法最好一次注入所有的 model');
      }
      const modelMap = {};
      model.forEach(item => {
        const namespace = item.namespace;
        const namespaceModel = batchModel(item);
        modelMap[namespace] = namespaceModel;
        injectModel(namespaceModel, namespace);
      });
      return modelMap;
    }
    // app.model 的执行必须是在 app.router 之前，确保 useModel、dispatch、actionType、actionCreator 的正常使用
    if (app.$router) {
      console.warn(`
        请按照 : \r\n 
        1、const app = tangdao(); \r\n 
        2、app.use(); \r\n 
        3、app.model(); \r\n 
        4、app.router(require("xxx"); \r\n 
        5、app.start("el") \r\n 
        顺序和规范执行唐刀的初始化, 否则将无法正常获取和使用 useModel、dispatch、actionType、actionCreator
      `);
    }
    const modelMap = batchModel(model);
    getStore();
    return modelMap;
  }

  /**
   * 注册单个或者批量 model，只是注册 model 不会进行 store 的创建
   */
  function batchModel(model) {
    if (!isArray(model)) {
      model = [model];
    }
    const modelMap = {};
    const { updateState, stateToJS } = app.$options;
    model.forEach( item => {
      if (process.env.NODE_ENV !== 'production') {
        checkModel(item, app.$models);
        // 检查是否提供了简单更新 state 的方法
        if (!!updateState && !isFunction(updateState)) {
          console.warn('请提供更新 state 的函数，用于自动创建更新 state 的 reducer');
        }
      }
      // 注册简单更新 state 的 reducer
      registerReducer(item, updateState, stateToJS);
      const namespace = item.namespace;
      const namespaceModel = setNamespace(item, app);
      // model 注册完成后，执行 model.init 进行 action 的联动或者返回其他操作以便在业务代码中使用。
      if (item.init && isFunction(item.init)) {
        const initData = item.init(namespaceModel.actionTypes, namespaceModel.actionCreator);
        if (initData && isPlainObject(initData)) {
          namespaceModel.initData = initData;
        }
      }

      app.$models.push(namespaceModel);
      app.actionCreator[namespace] = namespaceModel.actionCreator;
      app.actionTypes[namespace] = namespaceModel.actionTypes;
      modelMap[namespace] = namespaceModel;
    });
    return modelMap;
  }

  function unmodel(namespace) {
    invariant(isString(namespace), 'unmodel 方法只接受 string 参数');
    const models = app.$models;
    const store = app.store;
    const modelReducer = store.modelReducer;

    delete modelReducer[namespace];
    delete app.actionCreator[namespace];
    delete app.actionTypes[namespace];
    delete app.autoDispatch[namespace];
    delete dispatch[namespace];
    delete actionType[namespace];
    delete actionCreator[namespace];
    app.$models = models.filter((model) => {
      return model.namespace !== namespace;
    })
    const { reducer } = createReducer(app.$models, app.$options);
    store.replaceReducer(reducer);
    store.dispatch({
      type: '@@tangdao/UPDATE'
    });
    store.dispatch({
      type: `${namespace}/@@CANCEL_EFFECTS`
    });
    unlistenSubscription(app.$subscriptions, namespace);
  }

  /**
   * 替换已存在的 model
   * @param {String} namespace model 的命名
   * 用来替换一个 model，不会立刻修改 store 状态树上对应 model 的值
   */
  function replaceModel(m) {
    invariant(isPlainObject(m), 'replaceModel 方法只接受 plainObject 类型');
    const store = app.store;
    const {
      namespace
    } = m;
    const oldModelIdx = findIndex(app.$models, model => model.namespace === namespace);

    if (~oldModelIdx) {
      // 取消对应的 effect
      store.dispatch({
        type: `${namespace}/@@CANCEL_EFFECTS`
      });

      // 删除对应的 reducer
      delete store.modelReducer[namespace];
      unlistenSubscription(app.$subscriptions, namespace);
      // 从 app.$models 中删除旧 model
      app.$models.splice(oldModelIdx, 1);
    }

    // 添加新的 model
    injectModel(m);

    store.dispatch({
      type: '@@tangdao/UPDATE'
    });
  }
  /**
   * 在 app 执行完 start 后，注入一个 model
   */
  function injectModel(m, namespace) {
    const store = app.store;
    let injectModel = namespace === undefined ? batchModel(m) : m;
    if (namespace === undefined) {
      namespace = m.namespace;
    }
    injectModel = injectModel[namespace];
    const { reducer } = createReducer(app.$models, app.$options);
    store.replaceReducer(reducer);
    if (injectModel.effects) {
      store.runSaga(createSaga(injectModel, app.$options));
    }
    if (injectModel.subscriptions) {
      app.$subscriptions[namespace] = runSubscription(injectModel.subscriptions, injectModel, app);
    }
    const autoDispatch = actionCreators({
      [namespace]: app.actionCreator[namespace]
    }, store.dispatch);
    app.autoDispatch[namespace] = autoDispatch[namespace];
  }

  /**
   * 注册路由组件，必须是 require('xxxx').default 引入，否则无法正常使用 useModel、dispatch、actionCreator、actionType
   */
  function customRouter(routerFn) {
    invariant(isFunction(routerFn), `[app.router] router should be function, but got ${typeof routerFn}`);
    app.$router = routerFn;
  }

  function render() {
    const App = getProvider();
    ReactDOM.render(<App />, app.el);
  }

  function getProvider() {
    const tangdaoProvider = extraProps => (
      <Provider store={app.store} >
      {
        app.$router({
          app,
          history: app.history,
          ...extraProps
        })
      }
      </Provider>
    );
    return tangdaoProvider;
  }

  function patchHistory(history) {
    const oldListen = history.listen;
    history.listen = callback => {
      callback(history.location, history.action);
      return oldListen.call(history, callback);
    };
    return history;
  }

  /**
   * 通过 use 配置 hook,需要在 getStore 或者 start 之前调用
   */
  function use(hook) {
    if (!isPlainObject(hook)) {
      throw new Error('use 只接受 plainObject 类型的数据');
    }
    // 对 effectHooks 做类型检测
    const effectHooks = hook.effectHooks;
    if (effectHooks && isPlainObject(effectHooks)) {
      hook.effectHooks = [effectHooks];
    } else if (effectHooks && !isPlainObject(effectHooks)) {
      throw new Error('effectHooks 应为 plainObject 类型数据');
    }
    // 合并配置
    app.$options = mergeOptions(hook, app.$options);
  }
}

/**
 * 获取 create 创建的 app
 */
export function getApp() {
  const app = window[$appGlobalName];
  if (!app) {
    throw new Error('当前 tangdao app 尚未注册, 请使用 create 创建一个 app 应用');
  } else {
    return app;
  }
}

/**
 * 获取指定 model 下的 actionCreator、actionTypes
 */
export function useModel(namespace) {
  if (!namespace) {
    return;
  }
  if (isString(namespace)) { // 获取单个 model 的 action
    const app = getApp();
    const model = app.$models.find( model => model.namespace === namespace );
    if (!model) {
      console.warn(`不存在 namespace 为 ${namespace} 的 model`);
    } else {
      if (!app.autoDispatch[namespace]) {
        console.warn('useModel 无法找到 dispatch, 引入路由组件时请按照 app.router(require("xxxx").default) 规范引入');
      }
      return {
        ...model.initData,
        actionType: model.actionTypes,
        actionCreator: model.actionCreator,
        autoDispatch: app.autoDispatch[namespace],
        dispatch: dispatch[namespace]
      }
    }
  } else {
    console.warn('只接受类型为 string 的空间命名');
  }
}

