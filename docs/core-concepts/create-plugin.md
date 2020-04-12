## 插件机制

插件机制是为唐刀提供活力的源泉，开发者可以根据自身需求定制各种各样的插件来扩展唐刀的处理能力，以提高开发效率或者改善开发体验，目前唐刀内部置入的插件如下：

- loading
- effect-thunk

### 原理

开发者可以在唐刀创建 redux store 之前 (即：``td.start('#app')`` ) ，使用 ``app.use`` 方法可以注入初始化配置，其中常用 extraMiddleware、extraReducers、effectHooks 等属性组合，达到可以对每一个 acion 进行拦截控制处理。具体如下：

```javascript
// plugin

const plugin = {
  extraMiddleware: [
    ......
  ],
  extraReducers: {
    ......
  },
  effectHooks: {
    start: (sagaEffects, model, action) => {
      ......
    },
    end: (sagaEffects, model, action, result) => {
      ......
    }
  }
}
```

#### plugin.extraMiddleware

数据类型：数组

作用：为 redux 添加额外的中间件，与 redux 中间件为同一个概念，同一个功能。

#### plugin.extraReducers

数组类型：plainObject

作用：为 redux 注入额外的 reducer, 其值一样会被挂载到 redux store 上。与 redux 的 reducer 为同一个概念，同一个功能。

#### plugin.effectHooks

数据类型：plainObject

作用：用于拦截副作用 action，plugin.effectHooks.start 可以在 effect action 处理前进行相关操作处理，plugin.effectHooks.end 在 effect action 处理完后进行相关操作，并且可以拿到 effect action 返回的结果。

注意：任何插件都可以配置 effectHooks，如果一个应用中使用了多个插件，那么插件的 effectHooks 会被组合成数组，按照注册的先后顺序执行。不同插件的 effectHooks 不可沟通，无法拿到上一个 effectHooks  执行返回的值，异步的 effectHooks 会被使用 yield 执行，执行完毕后执行下一个 effectHook。

---

### 实战

目标：

针对 effect action 返回 promise，并且可以在 Promise.then 中获取 effect action 的返回值。

```javascript
// /plugins/thunk.js
const thunkMiddleware = () => next => action => {
  // effect action 返回 promise
  if (action.type.indexOf('/effect/') !== -1) {
    return new Promise(resolve => {
      action.resolve = resolve;
      next(action);
    })
  }
  next(action);
}
const thunk = {
  extraMiddleware: thunkMiddleware,
  effectHooks = {
    end: (sagaEffects, model, action, result) => {
      if (action.resolve) {
        action.resolve(result);
      }
    }
  }
}
export default thunk;

// /index.js
import tangdao from '@maoyan/tangdao';
import thunk from './plugins/thunk';

const td = tangdao({});
// 注册插件
td.use(thunk);
```
