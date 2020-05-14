import { connectRouter, routerMiddleware } from 'connected-react-router';
import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects'
import invariant from 'invariant';
import { NAMESPACE_SEP } from './model/index';
import { isFunction, isArray,  isGlobalType} from '../utils';

// 创建 redux store 需要的参数
const storeOptions = {
  initialReducer(history, reducers) {
    return  connectRouter(history)(reducers)
  },
  /**
   * 合并 redux 中间件
   * @param {*} extraMiddleware 用户传入的中间件
   * @param {*} selfMiddlewares 唐刀内置的中间件
   * @param {*} history
   */
  setupMiddlewares(extraMiddleware, sagaMiddleware, history) { // 中间件集合
    let middlewares = [];
    if (isFunction(extraMiddleware)) {
      middlewares = extraMiddleware(sagaMiddleware, routerMiddleware(history));
      invariant(isArray(middlewares), 'extraMiddleware 需要返回数组')
    } else if(isArray(extraMiddleware)){
      middlewares = [...extraMiddleware, sagaMiddleware, routerMiddleware(history)];
    }
    return middlewares;
  }
}

/**
 * 创建 redux
 * @param {Object} models
 * @param {Object} initConfig
 * @return redux store
 */
export default function createRedux(app) {
  const models = app.$models;
  const options = app.$options;
  const defaultInitState = options.initialState;
  const { reducer, sagas, initState, modelReducer } = createReducersAndSaga(models, options);
  const sagaMiddleware = createSagaMiddleware();
  const store = createReduxStore({
    reducers: reducer,
    initState: Object.keys(defaultInitState).length === 0 ? initState : defaultInitState,
    sagaMiddleware,
    options: app.$options
  });
  store.runSaga = sagaMiddleware.run;
  store.modelReducer = modelReducer;
  sagas.forEach(sagaMiddleware.run);
  subscribeStateChange(store, options.onStateChange);
  return store;
}

/**
 * 创建 reducer 和 saga
 * @param {Object} models
 * @param {Object} initialReducer
 */
export function createReducersAndSaga(models, options) {
  const initState = {};
  let sagas = [];
  const extraReducers = options.extraReducers;
  const reducers = {};

  // 查看是否有额外的 saga 传入
  const extraSagasLen = options.extraSagas.length;
  if (options.extraSagas.length !== 0) {
    sagas.push(function* () {
      for (let i = 0, len = extraSagasLen; i < len; i++) {
        yield sagaEffects.fork(options.extraSagas[i]);
      }
    })
  }

  // 对每一个 model 进行遍历处理
  for (const model of models) {
    if (isGlobalType(model)) {
      continue;
    }
    const namespace = model.namespace;
    if (model.reducers) {
      initState[namespace] = model.state;
      reducers[namespace] = getReducer(model);
    }
    if (model.effects) {
      sagas.push(createSaga(model, options));
    }
  }
  // 如果存在额外的 reducer 则需要将其添加进来
  if (extraReducers) {
    Object.keys(extraReducers).forEach(key => {
      reducers[key] = extraReducers[key];
    })
  }
  // 得到最终的 reducer
  const finalReducer = storeOptions.initialReducer(options.history, combineReducers(reducers));

  return {
    initState: initState,
    reducer: finalReducer,
    modelReducer: reducers,
    sagas: sagas
  }
}

export function getReducer(model) {
  const reducers = model.reducers;
  if (Array.isArray(reducers)) { // 对改 reducer 配置了增强器
    const [reducer, enhancer] = reducers;
    return enhancer(wrapReducer(reducer, model));
  } else {
    return wrapReducer(reducers || {}, model);
  }
}

/**
 * 针对每一个 model 包装成一个 reducer
 * @param {Object} handlers model.reducers
 * @param {Object} model
 */
function wrapReducer(handlers, model) {
  const defaultState = model.state;
  const namespace = model.namespace;
  const reducerTypes = model.reducerTypes; // reducerTypes 存储了 model.reducers 上原始的 key
  const actionCreator = model.actionCreator;
  return (state = defaultState, action) => {
    let actionType = action.type;
    // 判断 model 中 reducer 和 effects 是否有重名的 action key
    if (actionType.indexOf('/effect/') > 0) {
      actionType = actionType.replace('effect/', '');
    }
    // 检测该 actionType 是否在 model.reducers 上注册，actionType: 没有经过 setNamespace 处理和 经过 setNamespace 处理
    if (handlers[actionType] || reducerTypes.indexOf(actionType) !== -1) {
      if (!handlers[actionType] && actionCreator[actionType]) { // reducers 是 namespace/key => key ; actionCreator 是 key => namespace/key
        actionType = `${namespace}${NAMESPACE_SEP}${actionType}`;
      }
      if (isFunction(handlers[actionType])) {
        const newState = handlers[actionType](state, action, actionCreator);
        return newState ? newState : state;
      }
    } else {
      return state;
    }
  }
}

/**
 * 1、完成每一个副作用的监听
 * 2、执行 fork
 * @param {*} effects
 */
export function createSaga(model, options) {
  const effects = model.effects;
  return function* () {
    for (const type in effects) {
      if (Object.hasOwnProperty.call(effects, type)) {
        const watchedEffect = watchEffect(type, effects[type], options, model);
        const task = yield sagaEffects.fork(watchedEffect);
        // 用于 saga effect 的卸载
        yield sagaEffects.fork(function* () {
          yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`);
          yield sagaEffects.cancel(task);
        });
      }
    }
  }
}

/**
 * 根据指定的 effect 的类型（默认为 takeEvery ）来监听 effect
 * 目前只支持 takeEvery 、takeLatest 、throttle
 * @param {Object} actionType
 * @param {Object} effect
 * @param {Object} options
 * @param {Object} model
 */
function watchEffect(actionType, effect, options, model) {
  let $effect = effect;
  let type = 'takeEvery';
  let ms;
  // 处理是否指定了 effect 的 effect处理类型
  if (Array.isArray(effect)) {
    const [handler, options] = effect;
    $effect = handler;
    if (options && options.type) {
      type = options.type;
      if (type === 'throttle') {
        invariant(options.ms, 'app.start: opts.ms should be defined if type is throttle');
        ({ ms } = options);
      }
    }
    invariant(
      ['takeEvery', 'takeLatest', 'throttle', 'custom'].indexOf(type) > -1,
      'app.start: effect type should be takeEvery, takeLatest, throttle, poll or watcher'
    );
  }
  switch (type) {
    case 'takeLatest':
      return function* () {
        yield sagaEffects.takeLatest(actionType, watchEffectFn($effect, actionType, options, model));
      };
    case 'throttle':
      return function* () {
        yield sagaEffects.throttle(ms, actionType, watchEffectFn($effect, actionType, options, model));
      };
    case 'custom': // 用户自定义 effect, 系统不会为其注册，具体注册逻辑由用户自己定义，自定义部分的 action , 不会被系统收录
      const customType = actionType.split(`${model.namespace}/`)[1];
      delete model.actionCreator[customType];
      delete model.actionTypes[customType];
      return function* () {
        yield $effect(sagaEffects);
      }
    default:
      return function* () {
        yield sagaEffects.takeEvery(actionType, watchEffectFn($effect, actionType, options, model));
      };
  }
}

function watchEffectFn(effect, actionType, options, model) {
  const effectHooks = options.effectHooks;
  return function* (action) {
    try {
      effectHooks.start && (yield effectHooks.start(sagaEffects, model, action));
      const result = yield effect(action, sagaEffects, model.actionCreator);
      effectHooks.end && (yield effectHooks.end(sagaEffects, model, action, result));
    } catch (err) {
      options.$globalOnError(err, { key: actionType, effectArgs: action })
    }
  }
}

function createReduxStore({ reducers, initState, sagaMiddleware, options }) {
  const extraMiddleware = options.extraMiddleware || [];
  // const middlewares = storeOptions.setupMiddlewares([sagaMiddleware, ...extraMiddleware], options.history);
  const middlewares = storeOptions.setupMiddlewares(extraMiddleware, sagaMiddleware, options.history);
  let composeEnhancers = compose;
  if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, maxAge: 30 });
  }
  const extraEnhancers = options.extraEnhancers ? options.extraEnhancers : [];
  const enhancers = [applyMiddleware(...middlewares), ...extraEnhancers];
  reducers = options.wrapReducer ? options.wrapReducer(reducers) : reducers;
  return createStore(reducers, initState, composeEnhancers(...enhancers));
}

/**
 * 订阅 state 发生变化
 */
function subscribeStateChange(store, listener) {
  if (!listener) {
    return;
  }
  store.subscribe(() => {
    listener(store.getState());
  });
}