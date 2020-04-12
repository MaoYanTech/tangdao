import invariant from 'invariant';
import { NAMESPACE_SEP } from './model/index';
import { isFunction } from '../utils';

function prefixType(type, model) {
  const prefixedType = `${model.namespace}${NAMESPACE_SEP}${type}`;
  const typeWithoutAffix = prefixedType.replace(/\/@@[^/]+?$/, '');
  if (
    (model.reducers && model.reducers[typeWithoutAffix]) ||
    (model.effects && model.effects[typeWithoutAffix])
  ) {
    return prefixedType;
  }
  return type;
}

function prefixedDispatch(dispatch, model) {
  return action => {
    const { type } = action;
    invariant(type, 'dispatch: action should be a plain Object with type');
    invariant(type.indexOf(`${model.namespace}${NAMESPACE_SEP}`) !== 0, `dispatch: ${type} should not be prefixed with namespace ${model.namespace}`);
    return dispatch({
      ...action,
      type: prefixType(type, model)
    });
  };
}

export function runSubscription(subs, model, app) {
  const funcs = [];
  const nonFuncs = [];
  const onError = app.$options.$globalOnError;
  for (const key in subs) {
    if (Object.prototype.hasOwnProperty.call(subs, key)) {
      const sub = subs[key];
      const unlistener = sub(
        {
          dispatch: prefixedDispatch(app.store.dispatch, model),
          history: app.history
        },
        onError
      );
      if (isFunction(unlistener)) {
        funcs.push(unlistener);
      } else {
        nonFuncs.push(key);
      }
    }
  }
  return { funcs, nonFuncs };
}

export function handleSubscriptions(app) {
  const unlisteners = {};
  for (const model of app.$models) {
    if (model.subscriptions) {
      unlisteners[model.namespace] = runSubscription(model.subscriptions, model, app);
    }
  }
  return unlisteners;
}

export function unlistenSubscription(unlisteners, namespace) {
  if (!unlisteners[namespace]) return;
  const { funcs, nonFuncs } = unlisteners[namespace];
  invariant(
    nonFuncs.length === 0,
    `[app.unmodel] subscription should return unlistener function, check these subscriptions ${nonFuncs.join(', ')}`
  );
  for (const unlistener of funcs) {
    unlistener();
  }
  delete unlisteners[namespace];
}