### tangdao(opts)

---

创建唐刀实例（不支持多实例）

```javascript
import tangdao from '@maoyan/tangdao';
const td = tangdao(opts);
```

### 实例方法

- use
- model
- router
- start
- getStore
- replaceModel
- injectModel
- unmodel

### use

使用插件或者配置初始化配置，支持所有初始化属性，在 ``td.getStore`` 或者 ``td.start`` 前使用。

```javascript
import tangdao from '@maoyan/tangdao';
const td = tangdao(opts);
td.use(opts)
```

用来配置初始化配置，opts 等同与``tangdao(opts)`` 中的 opts。比如注册 loading 插件的例子。

```javascript
import tangdao, { loading } from '@maoyan/tangdao';
const td = tangdao(opts);
td.use(loading())
```

### model

注册 model, 支持传入**数组**批量注册 model。

**创建 model 文件**

```javascript
// /model/count.js
const count = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) {
      return state + payload
    }
  }
}

export default count;
```

**注册 model**

```javascript
import tangdao, { loading } from '@maoyan/tangdao';
import count from './model/count.js';

// 创建实例
const td = tangdao(opts);
// 使用插件
td.use(loading());
// 注册 model
td.model(count);
```

**如果存在多个 model, 可以进行批量注册**

```javascript
import tangdao, { loading } from '@maoyan/tangdao';
import count from './model/count.js';

// 创建实例
const td = tangdao(opts);
// 使用插件
td.use(loading());
// 批量注册 model
td.model([count, ...]);
```

### router

注册路由表。

对于单页应用推荐将路由信息抽成一个单独的文件, 如下所示：

**创建路由文件**

```javascript
// /router.js
import { Router, Route } from '@maoyan/tangdao';

const routerApp = history => (
    <Router history={history}>
      <Route path="/" component={App} />
    </Router>
);

export default routerApp;
```

在注册路由表时，唐刀会将初始化配置中的 history 传递给路由表，如果没有指定 history，那么默认使用 hashHistory。

**注册路由表**

```javascript
// /index.js
import { Router, Route } from '@maoyan/tangdao';
import RouterApp from './router';
// 创建实例
const td = tangdao(opts);
// 使用插件
td.use(loading());
// 批量注册 model
td.model([count, ...]);
// 注册路由表
td.router(RouterApp);
```

有些场景可能不使用路由，比如多页应用，所以也可以传入返回 JSX 元素的函数。比如:

```javascript
td.router(() => <App />);
```

### start

启动应用，将组件挂载到指定的 dom 节点。el 可选，如果没有 el 参数，会返回一个返回 JSX 元素的函数。

注：redux store 的创建发生在 td.start 阶段。

```javascript
// /index.js
import { Router, Route } from '@maoyan/tangdao';
import RouterApp from './router';

// 创建实例
const td = tangdao(opts);
// 使用插件
td.use(loading());
// 批量注册 model
td.model([count, ...]);
// 注册路由表
td.router(RouterApp);
// 启动应用
```

### getStore

创建或者获取 redux store。

```javascript
// /index.js
import { Router, Route } from '@maoyan/tangdao';
import RouterApp from './router';

// 创建实例
const td = tangdao(opts);
// 使用插件
td.use(loading());
// 批量注册 model
td.model([count, ...]);
// 创建 store
const store = td.getStore();
```



### replaceModel

替换 model 为新 model，同时会清理旧 model 的 reducers, effects 和 subscriptions，但会保留旧的 state 状态。  

subscription 如果没有返回 unlisten 函数，使用 td.replaceModel 会给予警告。

如果原来不存在相同 namespace 的 model，那么执行 td.injectModel 帮你注入一个 model 。

```javascript
// 替换 model
td.replaceModel({
   namespace: 'count_mutil',
   state: 1,
   reducers: {
     mutil: function(state, { payload }, actionCreator) {
       return state * 2;
     }
   }
});
```

### injectModel

在 redux store 创建完毕后动态注入 model。

```javascript
td.injectModel({
  namespace: 'countInject',
  state: -1,
  reducers: {
    decrease: function(state, { payload }, actionCreator) {
      return state - payload;
    }
  }
});
```

### unmodel

取消 model 的注册，清理 reducer, effects 和 subscriptions；

subscription 如果没有返回 unlisten 函数，使用 td.unmodel 会给予警告

```
td.unmodel('count');
```
