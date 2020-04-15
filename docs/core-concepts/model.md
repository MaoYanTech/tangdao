- [介绍](https://maoyantech.github.io/tangdao/introduction)
- 核心概念
  - [初始化配置](https://maoyantech.github.io/tangdao/core-concepts/initialization-options)
  - model
  - [action 管理](https://maoyantech.github.io/tangdao/core-concepts/action-manage)
  - [自动创建 reducer](https://maoyantech.github.io/tangdao/core-concepts/update-state)
  - [插件机制](https://maoyantech.github.io/tangdao/core-concepts/create-plugin)
- [插件列表](https://maoyantech.github.io/tangdao/plugins)
- [API 列表](https://maoyantech.github.io/tangdao/api-reference)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide)

model 是唐刀重要的概念，它将 redux 的 reducer、action 和 redux-saga 的 effect 以对象配置的形式管理在一个 javascript 对象中。以下是一个完整的 model 对象：

```javascript
const count = {
  namespace: 'count',
  state: 0,
  init(actionType, actionCreator) {
    return {
      
    }
  },
  updateState(state, key, { payload }) {
    // ... 具体的更新逻辑视项目而定。
    state[key] = payload;
    return state;
  },
  reducers: {
    add(state, { payload }) {
      return state + payload;
    },
  },
  effects: {
    *asyncAdd({ payload }, { put }, actionCreator) {
      yield new Promise(resolve => setTimeout(resolve, 300));
      yield put(actionCreator.add);
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          dispatch({ type: 'load' });
        }
      });
    },
  },
}
```

#### 属性解释：

#### namepsace

model 的命名空间，也是 model 在全局 state 上的属性，只支持字符串不支持通过 **.** 的方式创建多层命名空间。

#### state

类型：``any``

初始值

优先级低于初始化配置的 initialState。

```javascript
import tangdao from '@maoyan/tangdao';

const td = tangdao({
  initialState: {
    count: 100
  }
});

td.model({
	namespace: 'count'
  state: 0,
  ...
})
```

最终创建 redux store，store.state.count 为 100。

#### init

类型：``Function``

返回一个对象，这个对象可以通过 ``useModel`` 获取。

初始化操作，在注册 model 后执行，具体操作如下：

**注册 model**

```javascript
// /index.js
import tangdao from '@maoyan/tangdao';

const td = tangdao();

td.model({
 namespace: 'count'
  state: 0,
  init(actionType, actionCreator) {
  return {
    selector: {
      getLoading: state => state.aggregation.loading,
      getAggregationsList: state => state.aggregation.aggregationsList,
      getPipelineList: state => state.aggregation.pipelineList,
    }
  },
});

// 省略注册路由表等过程
....

// /pages/app.js
import { useModel } from '@maoyan/tangdao';

function App(props) {
  const { actionType, actionCreator, autoDispatch, selector } = useModel('count');
  
  return (
  	<div>
    	....
    </div>
  )
}
```

#### updateState

类型:  ``Function``

更新 state 的工厂函数，用于自动创建 reducers。函数内的处理逻辑根据具体情况编写，并不局限于简单的更新赋值，优先级高于初始化配置的全局 ``updateState`` 方法。

```javascript
import tangdao from '@maoyan/tangdao';

const count = {
  namespace: 'count',
  state: {
    count: 0
  },
  updateState(state, key, { payload }) {
    state[key] = payload;
    return state;
  }
}

const td = tangdao();
td.model(count);
```

详情请看 [核心概念/reducer 的自动创建](https://github.com/MaoYanTech/tangdao/wiki/update-state) 一节

#### reducers

类型：``Object``

以 key/value 的形式定义 ，定义处理同步 action 的处理方法，是唯一处理 state 的地方，由 ``dispacth(action)`` 触发，用来注册 reducer。

两种使用格式

``(state, action, actionCreator) => newState``

或者

enhancer 为 reducer 增强器 

``[(state, action, actionCreator) => newState, enhancer]``

reducer 内的方法一共接受三个参数，如下：

- state： 当前 mode 的 state
- action： 当前被派发的 action, 格式为：

```javascript
{  
    type, // 当前要执行的动作
    payload // action 中传递的数据
}
```

- actionCreator 创建具体的 action，格式如下：

```javascript
actionCreator = {
    // key 为 reducers 中定义的键名
    key: function(payload) {
        return {
            type: namespace/key,
            payload
        }
    }
}
```

------

#### effects

类型：``Object``

以 key/value 的形式定义，定义异步 action 的处理方法，由 dispatch(action) 触发，也可以在内部触发，用来注册 saga effect。

两种使用方式

`(effectApi, action, actionCreator) => {......}  `

或者

`[(effectApi, action, actionCreator) => {......}, { type }]  `

type 可以指定以何种形式监听 effect action，目前仅支持：

- takeEvery
- takeLatest
- throttle
- custom

effects 内的方法一共接受三个参数，如下：

- effectApi redux-saga/effects 中所有的方法
- action 当前被派发的 action, 格式为：

```javascript
{  
    type, // 当前要执行的动作
    payload // action 中传递的数据
}
```

- actionCreator 创建该 model 下的 action，格式如下：

```javascript
actionCreator = {
    // key 为 effects 中定义的键名
    key: function(payload) {
        return {
            type: namespace/key,
            payload
        }
    }
}
```

------

#### subscriptions

以 key/value 格式定义 subscription。subscription 是订阅，用于订阅一个数据源，然后根据需要 dispatch 相应的 action。在 app.start() 时被执行，数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。

格式为

```
({ dispatch, history }, done) => unlistenFunction
```

注意：如果要使用 app.unmodel()，subscription 必须返回 unlisten 方法，用于取消数据订阅。