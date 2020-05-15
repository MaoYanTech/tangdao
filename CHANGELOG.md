### Changelog

---

此项目所有的修改都会被记录在这个文件

#### 【1.1.1】 - 2020-05-15

**Fixed**

- 修复 replaceModel 和 unModel 遗留问题：会丢失初始化传入的额外 reducer

#### 【1.1.0】 - 2020-05-13

**Fixed**

- 修复 model 方法不支持单个 model 注册，同时增加批次注入 model 功能
- 修复 replaceModel 和 injectModel 执行后，dispatch 丢失问题

#### 【1.0.6】 - 2020-04-24

**Add**

- useModel 默认添加 dispatch 属性

#### 【1.0.5】 - 2020-04-24

**Add**

- 添加 disptach、actionType、actionCreator 的默认输出
- 添加 batchModel 方法，批量注册 model
- model 方法添加创建 redux store 功能

#### 【1.0.3】 - 2020-04-09

**Add**

- 派发异步 action 传入 effectTick 回调函数，返回全局状态和 model 状态

**Fixed**

- 修复 updateState 无法处理 Immutable 等非纯 js 对象问题

#### 【1.0.2】 - 2020-03-05

loading 请求插件增加 only 属性，管理指定 model 或者异步 action 的请求状态

**Added**

- loading 初始化增加 only 属性，管理指定 model 或者异步 action 的请求状态