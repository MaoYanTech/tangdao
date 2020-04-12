import { isFunction } from '../../utils';

function thunkMiddleware() {
  return next => action => {
    // action 为副作用 action 返回 promise
    if (action.type.indexOf('/effect/') !== -1) {
      return new Promise(resolve => {
        action.resolve = resolve;
        next(action);
      })
    }
    next(action);
  }
}

const effectHooks = {
  end: function(sagaEffects, model, action, result) {
    if (isFunction(action.resolve)) {
      action.resolve(result);
    }
  }
}

export default {
  extraMiddleware: [thunkMiddleware],
  effectHooks
}