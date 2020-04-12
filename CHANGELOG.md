### Changelog

---

此项目所有的修改都会被记录在这个文件

#### 【1.0.3】 - 2020-04-09

**Add**

- 派发异步 action 传入 effectTick 回调函数，返回全局状态和 model 状态

**Fixed**

- 修复 updateState 无法处理 Immutable 等非纯 js 对象问题

#### 【1.0.2】 - 2020-03-05

loading 请求插件增加 only 属性，管理指定 model 或者异步 action 的请求状态

**Added**

- loading 初始化增加 only 属性，管理指定 model 或者异步 action 的请求状态

#### [1.0.1] - 2020-02-04

升级 1.0.1 版本请先查看文档 **升级 v1.0.1 注意事项**

**Added**

- 添加 effectThunk 插件，提供派发副作用返回 promise 能力
- 添加 reducer 自动注册功能
- 通过 action.type 区分同步 action 和异步 action, 所有异步 action 的 type 均带有 effect 标示

**Fixed**

- model.servers 属性去除，改为 init 属性, model.init 返回的数据均可在 useModel 的一级属性中获取
- 相关文档的重撰与补充

---

#### [0.1.31] - 2019-10-28


**Fixed**

- 修改配置项合并策略，解决 history 初始化失败问题

---

#### [0.1.27]

**Added**

- 添加 useModel 和 getApp 方法

