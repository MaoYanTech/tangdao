- [介绍](https://maoyantech.github.io/tangdao/introduction)
- [核心概念](https://maoyantech.github.io/core-concepts)
- [插件列表](https://maoyantech.github.io/tangdao/plugins)
- API 列表
  - [tangdao(opts)](https://maoyantech.github.io/tangdao/api-reference/tangdao(opts))
  - [useModel](https://maoyantech.github.io/tangdao/api-reference/use-model)
  - nextTick
  - [getApp](https://maoyantech.github.io/tangdao/api-reference/get-app)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide)

在下次 DOM 更新循环结束之后执行延迟回调。在派发同步 action 之后立即使用这个方法，可以获取更新后的 DOM以及最新 store.state。针对异步 action 的处理，我们帮你自动植入了 nextTick 功能。

通过使用 nextTick 功能可以将你从 ``componentWillReceiveProps`` 中解脱出来，不用再进行繁琐重复的 props 对比。

**注：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise**

**参数：**

- ``{Function} [callback]``
- ``{Object} [context]``

**用法**

创建 model

```javascript
// ./model/count

const count = {
  namespace: 'count',
  state: {
    count: 0
  },
  reducers: {
    add(state, { payload }) {
      state.count += payload;
      return state;
    }
  },
  effects: {
    * asyncAdd(state, { put, delay }, { payload }, actionCreator) {
      yield delay(10);
      yield put(actionCreator.add(payload));
    }
  }
}
```

创建视图

```javascript
// /pages/app.js

import React, { Component } from 'react';
import { connect, useModel, nextTick } from '@maoyan/tangdao';

class App extends Component {
  constructor(props){
    super(props);
    const { autoDispatch } = useModel('count');
    this.autoDispatch = autoDispatch;
  }
  handleAdd = () => {
    this.autoDispatch.add(1);
    nextTick(() => {
      const { count } = this.props;
      if (count > 10) {
        console.log('已经点击超过 10 次了哦～');
      }
      console.log(this.el.innerHTML);
    })
  }
  asyncAdd = () => {
     // 针对异步 ation, 传入回调函数即可使用 nextTick 功能
     // state: 全局 state, modelState: 当前 model 的 state
     countModel.autoDispatch.asyncAdd(1, (state, modelState) => {
        const { count } = this.props;
        if (count > 10) {
          console.log('已经点击超过 10 次了哦～');
        }
        console.log(this.el.innerHTML);
     });
  }
  render() {
    const { count } = props;
    return (
      <div>
        <span ref={el => { this.el = el; }}>当前计数器为：{count}</span>
        <button onClick={ this.handleAdd }>increment</button>
        <button onClick={() => {}>asyncAdd</button>
      </div>
    )
  }
}

export default connect(state => ({
  count: state.count
}))(App);
```

创建应用

```javascript
// /index.js
import React from 'react';
import ReactDOM from 'react-dom';
import tangdao from '@maoyan/tangdao';
import countModel from './model/count.js';
import App from './pages/app.js';

const td = tangdao({});
td.model(countModel);
// 挂载组件
ReactDOM.render(
  <Provider store={store}>
  	<App />
  </Provider>,
  document.getElementById('app')
);
```