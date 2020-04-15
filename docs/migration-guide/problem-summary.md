- [介绍](https://maoyantech.github.io/tangdao/introduction/index)
- [核心概念](https://maoyantech.github.io/core-concepts/index)
- [插件列表](https://maoyantech.github.io/tangdao/plugins/index)
- [API 列表](https://maoyantech.github.io/tangdao/api-reference/index)
- 迁移指南
  - [从 dva 迁移](https://maoyantech.github.io/tangdao/migration-guide/migrating-from-dva)
  - [从原生 redux 迁移](https://maoyantech.github.io/tangdao/migration-guide/migrating-from-redux)
  - 迁移问题总结

### 迁移问题总结

目前唐刀可接入的项目的要求：

- 基于 redux 体系的数据流管理

唐刀为以下 redux 体系的数据流管理提供了接入方案：

- 原始 redux 数据流体系 （ reducer + action + redux-saga)
- Dva 

---

#### 可能存在的问题

**依赖版本冲突**

在启动项目后，控制窗口可能会报错，这是因为唐刀内部的依赖版本与你的项目中的依赖版本产生了冲突，请检查以下版本是否相匹配（大概率是因为 react-redux、redux-saga、connected-react-router 这三个依赖产生的依赖冲突）：

请检查以下依赖版本

```
"connected-react-router": "^4.5.0",
"histore": "^1.0.0",
"react": "^15.5.4 || ^16.0.0",
"react-dom": "^15.5.4 || ^16.0.0",
"react-redux": "^4.4.8 || ^5.0.7",
"redux": "^3.6.0 || ^4.0.0",
"redux-saga": "^1.0.5",
"react-router-dom": "^4.3.0"
```

---

**react-router-dom 报错**

如果是单页应用，可能会抛错，解决方案如下：

将项目中的 react-router-dom 替换成唐刀

---

**redux-saga 批量执行失效**

新版本的 redux-saga 批量执行需要使用 yield all([...]) 执行