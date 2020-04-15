- [介绍](https://maoyantech.github.io/tangdao/introduction)
- 核心概念
  - 初始化配置
  - [model](https://maoyantech.github.io/tangdao/core-concepts/model)
  - [action 管理](https://maoyantech.github.io/tangdao/core-concepts/action-manage)
  - [自动创建 reducer](https://maoyantech.github.io/tangdao/core-concepts/update-state)
  - [插件机制](https://maoyantech.github.io/tangdao/core-concepts/create-plugin)
- [插件列表](https://maoyantech.github.io/tangdao/plugins)
- [API 列表](https://maoyantech.github.io/tangdao/api-reference)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide)

## 初始化

redux 初始化涉及的概念较多，比如 `compose` 、`thunk` 等等，同时 `reducer`、`initialState`、`middleware` 三个重要的概念被拆分函数方式调用。这种初始化方式非常函数式，不容易理解。所以唐刀采取了对象配置的方式将redux 初始化配置化，方便理解。

唐刀提供了多种配置属性，让开发者可以访问 redux 初始化、创建的过程，甚至可以增强 redux 功能。具体的配置对象如下所示：

- initialState

- history

- onError

- onStateChange

- updateState

- wrapReducer

- extraReducers

- extraEnhancers

- extraMiddleware

- extraSagas

- effectHooks

- stateToJS

- effectThunk

  

  

### initailState

```javascript
import tangdao from '@maoyan/tangdao';

const td = tangdao({
  intialState: any
})
```

指定 redux 初始 state，可以任何类型的值，优先级高于 model 中的 state。

### history

指定给路由用的 history，默认是 hashHistory。如果需要配置 history 为 `browserHistory` ，如下所示：

```javascript
import tangdao from '@maoyan/tangdao';
import createHistory from 'history/createBrowserHistory';

const td = tangdao({
  history: createHistory()
});
```

### onError

类型:  ``Function``

 异步 action 执行错误或 subscription 通过 done 主动抛错时触发，可用于管理异步 action 和subscription 出错状态。

```javascript
import tangdao from '@maoyan/tangdao';

const td = tangdao({
  onError(e) {
   ......
  },
});
```

### onStateChange

类型: ``Function``

当 state 改变时触发，可用于同步 state 到 localStorage，服务器端等操作。

```javascript
import tangdao from '@maoyan/tangdao';

const td = tangdao({
  onStateChange(state) {
   ......
  },
});
```

### updateState

类型:  ``Function``

state 更新工厂函数，用于自动创建 reducers 使用。函数内的处理逻辑根据具体情况编写，并不局限于简单的更新赋值，优先级低于 ``model.updateState``

```javascript
import tangdao from '@maoyan/tangdao';

const td = tangdao({
  updateState(state, key, { payload }) {
  	state[key] = payload;
    return state;
  },
});
```

详情请看 [核心概念/reducer 的自动创建](https://github.com/MaoYanTech/tangdao/wiki/update-state) 一节

### wrapReducer

类型:  ``Function``

对所有 reducer 进行统一封装，属于对 reducer 的增强处理。比如借助 redux-undo 实现 redo/undo。

```javascript
import tangdao from '@maoyan/tangdao';

const td = tangdao({
    wrapReducer: reducer => {
        return (state, action) => {
                const undoOpts = {};
                const newState = undoable(reducer, undoOpts)(state, action);
                return { ...newState, routing: newState.present.routing };
            }
        },
    }
});
```

### extraReducers

类型: ``Object``

添加额外的 reducer，比如 redux-form 需要指定额外的 form reducer

```javascript
import tangdao from '@maoyan/tangdao';
import { reducer as formReducer } from 'redux-form'

const td = tangdao({
    extraReducers: formReducer
})
```

### extraEnhancers

类型: ``Array``

指定额外的 StoreEnhancer ，比如结合 redux-persist 的使用。

StoreEnhancer 是一个高阶函数用来增强 store 功能，参数是创建 store 的函数，可以返回一个功能更加强大的 store 创建函数。

```javascript
import tangdao from '@maoyan/tangdao';

function autoLogger() {
    return createStore => (reducer, initialState, enhancer) => {
      const store = createStore(reducer, initialState, enhancer)
      function dispatch(action) {
        console.log(`dispatch an action: ${JSON.stringify(action)}`);
        const res = store.dispatch(action);
        const newState = store.getState();
        console.log(`current state: ${JSON.stringify(newState)}`);
        return res;
      }
      return {...store, dispatch}
    }
}
const td = tangdao({
    extraEnhancers: [autoLogger()],
})
```

### extraMiddleware

类型:  ``Array || Function``

用于注册 redux 中间件。

类型为数组时会将传入的 extraMiddleware 中间件与唐刀内置的 sagaMiddleware 和 routerMiddleware 两个中间件进行合并。

```javascript
import tangdao from '@maoyan/tangdao';

function logger({ getState }) {
  return next => action => {
    console.log('will dispatch', action)
    const returnValue = next(action)
    console.log('state after dispatch', getState())
    return returnValue
  }
}

const td = tangdao({
  extraMiddleware: [logger]
})
```

如果想控制中间件的顺序，那么可以配置一个函数对所有中间件（包括唐刀内置的 sagaMiddleware 和 routerMiddleware ）进行一个排序。

```javascript
import tangdao from '@maoyan/tangdao';

function logger({ getState }) {
  return next => action => {
    console.log('will dispatch', action)
    const returnValue = next(action)
    console.log('state after dispatch', getState())
    return returnValue
  }
}

const td = tangdao({
  extraMiddleware: function(sagaMiddleware, routerMiddleware) {
    return [sagaMiddleware, routerMiddleware, logger]
  }
})
```

###extraSagas

类型:  ``Array``

添加额外的 saga 副作用。

```javascript
import tangdao from '@maoyan/tangdao';

const td = tangdao({
  extraSagas: []
})
```

### effectHooks

类型:  ``Object``

在 effect action 执行前和执行结束执行。比如 loading 插件就是基于此执行的。

```javascript
const app = tangdao({
    effectHooks: {
        start: function({call, put}, model, action) {
            // 在 effect 执行前做一些操作
            ......
        },
        end: function({call, put}, model, action) {
            // 在 effect 执行结束后做一些操作
            ......
        }
    }
})
```

注意：如果一个应用中使用了多个插件，那么插件的 effectHooks 会被组合成数组，按照注册的先后顺序执行。不同插件的 effectHooks 不可沟通，无法拿到上一个 effectHooks  执行返回的值。所有 effectHooks 函数默认会使用 yield 执行，执行完毕后执行下一个 effectHook。

### stateToJS

类型：``Function``

用于唐刀内部在处理 ``updateState`` 时，如果 model.state 非 plainObject，而是 **Immutable** 等数据类型，需要使用 ``stateToJS`` 将 model.state 转换成普通 js 对象。

### effectThunk

类型:  ``Boolean``

是否开启异步 action 返回 promise，默认值为 true。

effectThunk 为 true 时，派发异步 action 会返回 promise，如果需要在 then 中接受返回值，只需在异步 action 处理函数中将值 return 出去。具体如下所示：

**创建 model**

```javascript
// ./model/count.js

const count = {
  namespace: 'count',
  state: {
    count: 0
  },
  reducers: {
    add(state, { payload }) {
      return state.count += payload;
    }
  },
  effects: {
    * asyncAdd(state, {put}, { payload }, actionCreator) {
      yield put(actionCreator.add(1));
      // 将值返回，可以在 promise.then 中返回
      return true;
    }
  }
}

export default count;
```

**创建应用**

```javascript
// index.js

import tangdao, { useModel } from '@maoyan/tangdao';
import count from './model/count';

const td = tangdao();
td.model(count);
td.getStore();

const { autoDispatch } = useModel('count');
autoDispatch.asyncAdd(1).then(status => {
  if (status) {
    console.log('异步加法成功');
  }
})
```