import { isPlainObject, sleep, isNumber, isArray } from '../../utils';
import invariant from 'invariant';

const SHOW = '@TD_LOADING/SHOW';
const HIDE = '@TD_LOADING/HIDE';
let namespace = 'loading';

let loadingState = {
  global: false, // 全局的请求状态
  models: {},  // 具体到某一个 model 下的请求状态
  effects: {},  // 具体到某一个请求副作用的请求状态
  only: {} // 具体到某一个 model 或者异步 action 的请求状态
}

let delayConfig;

function initDelayConfig(delay) {
  if (!delayConfig && isPlainObject(delay)) { // 初始化默认 delay 配置
    delayConfig = {};
    invariant(isNumber(delay.duration), '请设置 delay 的 duration 延时时间');
    delayConfig.duration = delay.duration;
    if (delay.only) {
      invariant(isPlainObject(delay.only), 'delay.only 期望为 painObject 数据类型');
      delayConfig.only = {};
      const only = delay.only;
      if (only.model) {
        invariant(isArray(only.model), 'only.model 期望为数组类型');
        delayConfig.only.model = only.model;
      }
      if (only.action) {
        invariant(isArray(only.action), 'only.action 期望为数组类型');
        delayConfig.only.action = only.action;
      }
    }
  }
}

function handleDelay(delay, model, action) {
  if (!delay) {
    return false;
  }
  const delayDuration = delayConfig.duration;
  const only = delayConfig.only;
  if (!only) {
    return delayDuration;
  } else if (only.model.indexOf(model.namespace) !== -1) {
    return delayDuration;
  } else if (only.action.indexOf(action.type) !== -1) {
    return delayDuration;
  } else {
    return false;
  }

}

const loadingReducer = (state = loadingState, action) => {
  const { namespace, actionType } = action.payload || {};
  // const actionCanChage =  !effectAction || !isArray(effectAction);
  switch (action.type) {
    case SHOW:
      return {
        ...state,
        global: true,
        models: { ...state.models, [namespace]: true },
        effects: { ...state.effects, [actionType]: true }
      }
    case HIDE:
      {
        const effects = { ...state.effects, [actionType]: false };
        // 当前的 namespace 可能由多个请求，只要有一个请求未结束，那么 当前的 namespce 就为 true
        const models = {
          ...state.models,
          [namespace]: Object.keys(effects).some(actionType => {
            const _namespace = actionType.split('/')[0];
            if (_namespace !== namespace) return false;
            return effects[actionType];
          })
        };
        // 只要有一个 models 的请求未结束，那么当前的 global 就为 true
        const global = Object.keys(models).some(namespace => {
          return models[namespace];
        });
        return {
          ...state,
          global,
          models,
          effects
        };
      }
    default:
      return JSON.parse(JSON.stringify(state));
  }
}

export function loading(options) {
  options = options || {};
  if (!isPlainObject(options)) {
    throw new Error('loading 的 options 应为 plainObject');
  }
  initDelayConfig(options.delay);
  const initState = options.initState || {};
  namespace = options.namespace || namespace;
  const only = options.only;
  loadingState = {
    ...loadingState,
    ...initState,
    only: isPlainObject(only) ? only : {}
  }
  return {
    effectHooks: {
      start: function* ({ put }, model, action) {
        const namespace =  model.namespace;
        const actionType = action.type;
        const { model: effectModel, action: effectAction } = loadingState.only;
        const isOnlyModel = effectModel && isArray(effectModel) && effectModel.indexOf(namespace) !== -1;
        const isOnlyAction = effectAction && isArray(effectAction) && effectAction.indexOf(actionType) !== -1;
        const modelCanChange =  !effectModel || !isArray(effectModel);
        if (isOnlyModel || isOnlyAction || modelCanChange) {
          yield put({
            type: SHOW,
            payload: {
              namespace: model.namespace,
              actionType: action.type
            }
          });
        }
      },
      end: function* ({ put }, model, action) {
        const namespace =  model.namespace;
        const actionType = action.type;
        const { model: effectModel, action: effectAction } = loadingState.only;
        const isOnlyModel = effectModel && isArray(effectModel) && effectModel.indexOf(namespace) !== -1;
        const isOnlyAction = effectAction && isArray(effectAction) && effectAction.indexOf(actionType) !== -1;
        const modelCanChange =  !effectModel || !isArray(effectModel);
        if (isOnlyModel || isOnlyAction || modelCanChange) {
          // 是否进行延时操作
          let delay = handleDelay(options.delay, model, action);
          if (delay) {
            yield sleep(delay);
          }
          yield put({
            type: HIDE,
            payload: {
              namespace: model.namespace,
              actionType: action.type
            }
          });
        }
      }
    },
    extraReducers: {
      [namespace]: loadingReducer
    }
  }
}