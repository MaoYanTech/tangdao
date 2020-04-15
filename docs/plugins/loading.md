- [介绍](https://maoyantech.github.io/tangdao/introduction)
- [核心概念](https://maoyantech.github.io/core-concepts)
- 插件列表
  - loading
- [API 列表](https://maoyantech.github.io/tangdao/api-reference)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide)

### loading

---

管理 effect action 的请求状态，实现 loading 状态的自处理。使用该插件后，会在 store state 上挂载 loading 属性，保存全局、model、effect action 的请求状态。

##### 管理指定的 model 或 异步action 的请求状态

```javascript
import { loading } from '@maoyan/tangdao';

loading({
  only: {
    model: ['namespace_A', 'namespace_B'],
    action：['namespace_C/effect/fetch', 'namespace_D/effect/fetch']
  }
})
```

规则：

如果配置了 model ，则只管理所配置 model 下的所有异步 action 请求状态 ，如果配置了 action，则认为只管理配置的异步 action 请求状态。两者可以同时配置，出现交叉覆盖问题，则按优先级处理。

model 的优先级高于 action，如果 action 中所配置的某个 action 隶属于 only.model 中的某个 model, 则该action 的配置是无效的。

#### 示例

**创建 model**

```javascript
// /models/count.js

const count = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) {
      return state + payload;
    }
  }，
  effects: {
    *asyncAdd({ payload }, { put }, actionCreator) {
      yield new Promise(resolve => setTimeout(resolve, 1000));
      yield put(actionCreator.add(payload));
    }
  }
}

export default count;
```

**创建视图**

```javascript
// /pages/app.js

import React from 'react';
import { connect, useModel } from '@maoyan/tangdao';

function App(props) {
  const { count, loading } = props;
  const { autoDispatch, actionType } = useModel('count');
  return (
    <div>
      <div>当前计数器为：{count}</div>
      <div>
      {
        loading[actionType.asyncAdd] ? '计算中...' : ''
      }
      </div>
      <button onClick={() => { autoDispatch.add(1); }}>increment</button>
      <button onClick={() => { autoDispatch.asyncAdd(1); }}>asyncAdd</button>
    </div>
  )
}

export default connect(state => ({
  count: state.count,
  loading: state.loading
}))(App);
```

**创建应用**

```javascript
// /index.js

import React from 'react';
import ReactDOM from 'react-dom';
import tangdao, { loading } from '@maoyan/tangdao';
// 引入 count model
import countModel from './model/count.js';
// 引入视图组件
import App from './pages/app.js';

// 创建应用实例
const td = tangdao({});

// 注册 model
td.model(countModel);

// 挂载组件
ReactDOM.render(
  <Provider store={store}>
  	<App />
  </Provider>,
  document.getElementById('app')
);
```

#### 使用延时处理

```javascript
// /index.js

import React from 'react';
import ReactDOM from 'react-dom';
import tangdao, { loading } from '@maoyan/tangdao';
// 引入 count model
import countModel from './model/count.js';
// 引入视图组件
import App from './pages/app.js';

// 创建应用实例, 只针对 count model 和 actionType 为 'count/asyncAdd' 做延时处理
const td = tangdao({
  delay: {
    duration: 300,
    only: {
      model: ['count'],
      action: ['count/asyncAdd']
    }
  }
});

// 注册 model
td.model(countModel);

// 挂载组件
ReactDOM.render(
  <Provider store={store}>
  	<App />
  </Provider>,
  document.getElementById('app')
);
```

### API

|   属性    | 说明                           |  类型  |                  默认值                   |
| :-------: | :----------------------------- | :----: | :---------------------------------------: |
|   delay   | 对请求状态的结束做延时处理     | object |                   null                    |
| namespace | redux store state 上对应的属性 | string |                  loading                  |
| initState | 初始状态值                     | object | { global: true, model: {} , effects: {} } |
|   only    | 管理指定 model 或 异步action 的请求状态 | object | { model: [], action: [] }  |

### delay 延时设置

如果两个异步请求之间的间隔很短，我们可以延迟异步请求状态的改变。如果只想针对某些 model 或者某些异步action 做处理，只需设置 delay.only 即可。

**delay**

| 属性     | 说明                                        | 类型   | 默认值                     |
| -------- | ------------------------------------------- | ------ | -------------------------- |
| duration | 延时时长                                    | number | 0                          |
| only     | 指定哪些 model 和 action 进行结束的延时操作 | object | { model: [],  action: [] } |



