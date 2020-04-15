- [介绍](https://maoyantech.github.io/tangdao/introduction/index)
- [核心概念](https://maoyantech.github.io/core-concepts/index)
- [插件列表](https://maoyantech.github.io/tangdao/plugins/index)
- API 列表
  - [tangdao(opts)](https://maoyantech.github.io/tangdao/api-reference/tangdao(opts))
  - [useModel](https://maoyantech.github.io/tangdao/api-reference/use-model)
  - [nextTick](https://maoyantech.github.io/tangdao/api-reference/next-tick)
  - getApp
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide/index)

### getApp()

---

获取唐刀创建的应用实例，可以访问整个应用的配置信息、model、api、 store、action 等;

**注：getApp 必须在 redux store 创建完毕后才可使用，即执行了 td.getStore 或者 td.start 方法**

```javascript
import { getApp } from '@maoyan/tangdao';
console.log(getApp());
/*
{
    el, // 挂载节点
    $options, // 配置信息
    $models, // 存放所有 model 的地方
    start, // 函数，通过调用 start 函数可以将组件挂载指定元素下
    model, // 函数，通过调用 model 函数可以传入相关数据流配置
    unmodel, // 函数，用于卸载某个 model
    replaceModel, // 函数， 永远替换某个 model
    router, // 函数，路由配置
    actionCreator, // actionCreator 的管理
    actionTypes, // actionType 的 namespace 管理
    autoDispatch, // model 的 action 自动派发
    history,
    use, // 用于配置 hook
    getStore, // 在 app.start 之前获取 redux store
    injectModel, // 在 start 后注入一个 model
    globalModels, // 全局模块
    store // redux store
}
*/
```

