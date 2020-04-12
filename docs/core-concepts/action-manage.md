## action 分类

在唐刀中 action  被划分为两类：reducer action 和 effect action。

- reducer action：处理同步场景，是唯一可以修改 store state 的地方。
- effect action：处理异步场景，能够调用其他 action，不能修改 store state，但可以调用 reducer action 改变 store state

这两类 action 分别会被 model.reducers 和 model.effects 处理，具体如下：

- model.reducers：对应 redux 的 reducer，处理 reducer action
- model.effects：对应 redux-saga 的 effect，处理 effect action

---

### action 概念

在 redux 应用中，action 是一个普通的 javascript 对象，形式如下：

```javascript
{
  type: 'add',
  payload: payload
}
```

action 涉及到三部分概念：

- actionType
- actionCreator
- dispatch

----

#### actionType

actionType 是一个字符串，是 action 的标示，就像身份证号码一样用来分辨是哪一个 action，因此每一个 actionType  在全局都应该是独一无二的。

**actionType 唯一性**

那么唐刀是如何保证 actionType 的全局唯一性呢？

action 在唐刀中被分为两类分别被 model.reducers 和 model.effects 处理，model.reducers 和 model.effects 以 key/value 格式定义，那么定义时的 key 便被作为 actionType 被唐刀收集维护起来。

但是多个 model 中的 reducers 和 effects 可能存在相同的 key，因此单单使用定义时的 key 是远远不够的，还要加上 model.namespace 为前缀才可以，因为 model.namespace 是全局唯一，并且我们可以通过 actionType 的前缀清晰知道此 actionType 属于哪一个 model。因此，最终的 actionType 的格式为如下所示：

```javascript
// 同步 actionType
reducerActionType = `${mode.namespace}/${key}`;

// 异步 actionType
effectActionType = `${mode.namespace}/effect/${key}`;
```

**全局公共 actionType**

如果你需要一个不加 model.namespace 前缀，作为公共 actionType 访问。比如派发一个 action 可以被多个 model 处理，那么需要在定义 model.reducers 和 model.effects 时加上 **$$** 标示。具体如下：

```javascript
const count = {
  namesapce: 'count',
  state: 0,
  reducers: {
    $$add(state, { payload }) {
      ......
    }
  }
}
  
// actionTypes 
count.actionTypes = {
  add: 'add'
}
```

---

### actionCreator

actionCreator 是用来创建 action  的函数，格式如下：

```javascript
const actionCreator = (payload) => ({
	type: `${mode.namespace}/${key}`,
	payload
})
```

严格来说，每个 actionType 都应该有一个与之对应的 actionCreator ,  因此在注册 model 时，唐刀会为每一个 actionType 创建 actionCreator。

---

### autoDispatch

autoDispatch 可以自动派发一个 action，派发的 action 会被对应的 model 处理。在原生 redux 应用或者其他库中，我们需要手动的调用 dispatch 进行 action 的派发。这是一种很麻烦且不优雅的使用的方式。因此，唐刀为每一个 actionCreator 绑定了 dispatch，提供了 action 的自动派发。具体格式如下：

```javascript
const addAutoDispatch = payload => {
	dispatch(actionCreator.add(payload));
}
```

---

### 如何访问 actionType、actionCreator、autoDispatch

在 model 内，model.effects 是一个常访问 actionCreator 的地方，因此我们将该 model 下的 actionCreator 以参数的形式注入到 model.effects 中。

在 model 外，可以通过 ``useModel(namespace)`` 方法访问任意 model 下的 actionType、actionCreator 和 autoDispatch。

具体如下：

```javascript
// count model
const count = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) {
      return state + payload;
    }
  },
  effects: {
    * asyncAdd({ payload }, { put }, actionCreator) {
      yield new Promise(resolve => setTimeout(resolve, 1000));
      yield put(actionCreator.add(payload));
    }
  }
}
```

经过唐刀处理我们会得到该 model 的 actionType、actionCreator、autoDispatch

```javascript
// actionTypes
const actionTypes = {
  add: 'count/add',
  asyncAdd: 'count/effect/asyncAdd'
}

// actionCreator
const actionCreator = {
  add: payload => ({
    type: actionTypes.add,
    payload
  }),
  asyncAdd: payload => ({
    type: actionTypes.asyncAdd,
    payload
  }),
}

// autoDispatch
const autoDispatch = {
  add: payload => {
    dispatch(actionCreator.add(payload));
  },
  asyncAdd: payload => {
    dispatch(actionCreator.asyncAdd(payload));
  },
}
```

然后可以通过  ``useModel(namespace)`` 拿到上述所值，具体如下：

```javascript
import React from 'react';
import { connect, useModel } from '@maoyan/tangdao';

function App(props) {
  const { count } = props;
  const { actionCreator, actionType, autoDispatch } = useModel('count');
  return (
    <div>
      当前计数器为：{count}
      <button onClick={() => { autoDispatch.add(1); }}>increment</button>
      <button onClick={() => { autoDispatch.asyncAdd(1); }}>asyncAdd</button>
    </div>
  )
}

export default connect(state => ({
  count: state.count
}))(App);

```







