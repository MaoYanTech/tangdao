- [介绍](https://maoyantech.github.io/tangdao/introduction/index)
- [核心概念](https://maoyantech.github.io/tangdao/core-concepts/index)
- [插件列表](https://maoyantech.github.io/tangdao/plugins/index)
- [API 列表](https://maoyantech.github.io/tangdao/api-reference/index)
- 迁移指南
  - [从 dva 迁移](https://maoyantech.github.io/tangdao/migration-guide/migrating-from-dva)
  - 从原生 redux 迁移
  - [迁移问题总结](https://maoyantech.github.io/tangdao/migration-guide/problem-summary)

#### redux + redux-saga  项目接入指南

---

**安装**

```shell
npm install @maoyan/tangdao --sava
```

---

#### 初步迁移

初步迁移只是使用唐刀替代原始的数据流工具，不需要将数据流方案完全改造，因为唐刀可以与 redux 应用共存。

首先将项目中创建 redux store 的相关初始化工作按照唐刀初始化配置进行配置，然后将创建 store 的方式的改为唐刀，可以使用 ``td.start`` 或者 ``td.getStore`` 两个实例方法。

**创建应用**

将项目中与创建 store  相关的参数通过配置传入唐刀，创建应用。

```javascript
import tangdao, { loading } from '@maoyan/tangdao';

// 以下配置，如果项目有用到就传进去，没有就不传，另外唐刀还提供其他配置，详情请查看具体文档
const td = tangdao({
   history, // 可选项，需要就传，唐刀内置了 hashHistory
   initialState: initialState, // 创建 store 时的初始状态值
   extraReducers: reducers, // reducer, 以 key-value 格式传入
   extraSagas: sagas, // 以数组的格式将你的 saga 传入
   extraMiddleware: function(sagaMiddleware, routerMiddleware) { // 如果你对中间件的执行顺序有要求，那么可以使用函数自己决定中间件执行顺序；否则，可直接传入数组
     return [promiseMiddleware, sagaMiddleware, routerMiddleware];
   }
})

// 如果你的项目需要用到 effect loading 管控，具体配置可见文档
td.use(loading());
```

**生成 store**

利用传入的配置，唐刀内部使用 redux.createStore 生成 stroe

```javascript
const store = td.getStore();
// 或者
td.start('#app');
```

至此，你已经完成了唐刀的初步迁移，接入过程如果报错，请移步 [迁移问题总结](https://maoyantech.github.io/tangdao/migration-guide/problem-summary)

后期可以针对具体的模块进行样板文件的改造

---

#### model 的创建

将项目中的模块改造成 model 样板文件, 简要介绍下 model 文件，详情可见 [核心概念/model](https://maoyantech.github.io/tangdao/core-concepts/model)

```javascript
const model = {
  namespace: 'model', // 设置 namespace,将会对应 store 状态树上的 key
  state: '', // 设置初始状态值
  init: function(actionType, actionCreator) { // 与业务相关的 action 处理，可以返回任何参数，在业务代码中可以通过 useModel('namespace')

  },
  reducers: { // 定义 redux 的 reducer
    key: function(state, { payload } actionCreator) { 

    }
  },
  effects: { // 定义 saga 的副作用
    * key: function({ payload }, sagaEffect, actionCreator) {

    }
  }
}

// 注册 model
td.model(model);
// 或者批量注册
td.model([model])
```

如何访问某一 model 下的 actionType、actionCreator、autoDispatch。

在业务代码中，可以通过唐刀提供的 useModel 方法访问具体的 model

```javascript
import { useModel } from '@maoyan/tangdao';

const { actionType, actionCreator, dispatch } = useModel('namespace');
```

跨 model 访问，可以通过唐刀提供的 getApp 方法访问所有的 model。

```javascript
import { getApp } from '@maoyan/tangdao';

const model = app.$models;
```

---

#### 测试

测试通过即完成 model 样板文件的改造，可以上线
