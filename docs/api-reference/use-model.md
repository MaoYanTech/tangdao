- [介绍](https://maoyantech.github.io/tangdao/introduction)
- [核心概念](https://maoyantech.github.io/core-concepts)
- [插件列表](https://maoyantech.github.io/tangdao/plugins)
- API 列表
  - [tangdao(opts)](https://maoyantech.github.io/tangdao/api-reference/tangdao(opts))
  - useModel
  - [nextTick](https://maoyantech.github.io/tangdao/api-reference/next-tick)
  - [getApp](https://maoyantech.github.io/tangdao/api-reference/get-app)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide)

### useModel(namespace)

---

根据 namespace 获取 model 下的 actionType、actionCreator、autoDispatch 及 model 初始化方法返回的值。

**注：useModel 必须在 redux store 创建完毕后才可使用，即 ``app.getStore()`` 或者 ``app.start()`` 执行完毕**

**创建 model 文件**

```javascript
// /model/count.js

const count = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) {
      return state + payload;
    }
  }
}

```

**创建视图**

```javascript
// /pages/app.js

import React from 'react';
import { connect, useModel } from '@maoyan/tangdao';

function App(props) {
  const { count } = props;
  const { autoDispatch } = useModel('count');
  return (
  	<div>
    	<div>当前计数器为：{count}</div>
			<button onClick={() => { autoDispatch.add(1); }}>increment</button>
    </div>
  )
}

export default connect(state => ({
  count: state.count
}))(App);
```

**创建实例，启动应用**

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

// 注册视图
td.router(history => (
  <App />
));
          
// 启动应用
td.start('#app');
```

---

### actionType

提供了具体 model 下 reducers、effects 中 key 到 namespace/key 的映射

```javascript
actionType.add // 输出 count/add
```

### actionCreator

创建具体 model 下的 action，只支持单参传递，参数会作为 payload 属性传给 reducer 或 effect

```javascript
actionCreator.add(2);
```

等价于

```javascript
// 等价与
(function actionCreator(payload) {
	return {
		type: 'count/add',
		payload
	}
})(2)
```

**传递 payload 以外的参数，传入对象,参数中提供 payload 属性**

```javascript
actionCreator.add({
 meta: {},
 payload: 1
});
```

### autoDispatch

自动派发 action, 只支持单参传递，参数会作为 payload 属性传递给 reducer 或 effect

```javascript
autoDispatch.add(1)
```

 等价于

```javascript
dispatch({
	type: 'count/add',
	payload: 1
})
```

**传递 payload 以外的参数，传入对象,参数中提供 payload 属性**

```
autoDispatch.add({
 meta: {},
 payload: 1
});
```

### 额外属性

返回 ``model.init`` 方法中定义的业务相关方法，具体内容由你返回的内容决定。