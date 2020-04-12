### 介绍

唐刀是一款基于 redux + redux-saga 以 model 为核心的数据流管理工具，它将 store 和 saga 统一为 model 的概念，写在一个 js 文件中，以对象配置的概念维护 state、 reducers、effects 等。

文档：https://github.com/MaoYanTech/tangdao/wiki

另外唐刀将 redux 相关常用的库整合在一起方便取用，具体如下：

- react-router-dom
- connected-react-router
- react-redux
- redux-saga
- isomorphic-fetch

### 安装

```javascript
npm install --save @maoyan/tangdao
```

### 简单实践

我们通过创建一个简单计数应用来了解唐刀的正确开箱姿势。

#### 第一步：创建实例

``tangdao(opts)`` 可以用来配置应用的 reducer、saga、state 等一系列 redux + redux-saga 配置，具体细节可看

```javascript
// /index.js

import tangdao from '@maoyan/tangdao';

// 创建应用实例
const td = tangdao({});
```

#### 第二步：创建 model

model 是管理 state、reducer、effect 的地方。我们将 action 分为两类，同步（reducer action）和异步（effect action）。

- reducer action： 处理同步场景，是唯一可以修改 store state 的地方。

- effect action： 处理异步场景，能够调用其他 action，不能修改 store state。

```javascript
// /model/count.js

const count = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) {
      return state + payload;
    }
  }，
  effects: {
    * asyncAdd({ payload }, { put }, actionCreator) {
      yield new Promise(resolve => setTimeout(resolve, 1000));
      yield put(actionCreator.add(payload));
    }
  }
}

export default count;
```

#### 第三步：注册 model

将定义好的 model 对象交由唐刀进行注册。

```javascript
// /index.js

import tangdao from '@maoyan/tangdao';
// 引入 count model
import countModel from './model/count.js';

// 创建应用实例
const td = tangdao({});

// 注册 model
td.model(countModel);

```

#### 第四步：定义视图

唐刀将 redux 相关的库整合到了一起，例如 react-redux、react-router-dom、connected-react-router 等，方便直接取用。

```javascript
// /pages/app.js

import React from 'react';
import { connect, useModel } from '@maoyan/tangdao';

const countModel = useModel('count');

function App(props) {
  const { count } = props;
  return (
    <div>
      当前计数器为：{count}
      <button onClick={() => { countModel.autoDispatch.add(1); }}>increment</button>
      <button onClick={() => { countModel.autoDispatch.asyncAdd(1); }}>asyncAdd</button>
    </div>
  )
}

export default connect(state => ({
  count: state.count
}))(App);
```

#### 第五步：获取 redux store

```javascript
// /index.js

import tangdao from '@maoyan/tangdao';
// 引入 count model
import countModel from './model/count.js';
// 引入视图组件
import App from './pages/app.js';

// 创建应用实例
const td = tangdao({});

// 注册 model
td.model(countModel);

// 获取 redux store
const store = td.getStore();
```

#### 第六步：挂载组件

```javascript
// /index.js
import React from 'react';
import ReactDOM from 'react-dom';
import tangdao, { Provider } from '@maoyan/tangdao';
// 引入 count model
import countModel from './model/count.js';
// 引入视图组件
import App from './pages/app.js';

// 创建应用实例
const td = tangdao({});

// 注册 model
td.model(countModel);

// 获取 redux store
const store = td.getStore();

// 挂载组件
ReactDOM.render(
  <Provider store={store}>
  	<App />
  </Provider>,
  document.getElementById('app')
);
```

### License

[MIT](https://github.com/MaoYanTech/tangdao/blob/master/LICENSE)
