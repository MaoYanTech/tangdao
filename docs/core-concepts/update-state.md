- [介绍](https://maoyantech.github.io/tangdao/introduction)
- 核心概念
  - [初始化配置](https://maoyantech.github.io/tangdao/core-concepts/initialization-options)
  - [model](https://maoyantech.github.io/tangdao/core-concepts/model)
  - [action 管理](https://maoyantech.github.io/tangdao/core-concepts/action-manage)
  - 自动创建 reducer
  - [插件机制](https://maoyantech.github.io/tangdao/core-concepts/create-plugin)
- [插件列表](https://maoyantech.github.io/tangdao/plugins)
- [API 列表](https://maoyantech.github.io/tangdao/api-reference)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide)

在 redux 应用中，reducer 负责 state 的更新，并不承担数据处理的任务。针对不同的 action， reducer 内部都有独立的处理的逻辑。大部分情况下，只是根据 action 更新 store state 上的属性, 并不进行数据处理。因此，对于这种情况可以使用统一的工厂函数来进行替代。比如：

```javascript
const todo = {
  namespace: 'todo',
  state: {
    list: [],
    todoList: [],
    loadingStatus: true
  },
  reducers: {
    setList(state, { payload }) {
      state.list = payload;
      return state;
    },
    setTodoList(state, { payload }) {
      state.todoList = payload;
      return state;
    },
    setLoadingStatus(state, { payload }) {
      state.loadingStatus = payload;
      return state;
    }
  }
}
```

使用工厂函数：

```javascript
const updateState = key => (state, { payload }) => {
  state[key] = payload;
  return state;
}

const todo = {
  namespace: 'todo',
  state: {
    list: [],
    todoList: [],
    loadingStatus: true
  },
  reducers: {
    setList: updateState('list'),
    setTodoList: updateState('todoList'),
    setLoadingStatus: updateState('loadingStatus')
  }
}
```

通过使用工厂函数 ``updateState`` 可以简化 model.reducers 的编写，减少重复性工作。为了进一步的简化，唐刀提供了 action 处理方法的自动创建能力。如下所示：

```javascript
import tangdao from '@maoyan/tangdao';

const todo = {
  namespace: 'todo',
  state: {
    list: [],
    todoList: [],
    loadingStatus: true
  },
  updateState(state, key, { payload }) {
    // ... 具体的更新逻辑视项目而定。
    state[key] = payload;
    return state;
  }
}

const app = tangdao();
app.model(todo);
console.log(todo.reducers); //输出 setList、setTodoList、setLoadingStatus

```

在自动创建 reducers 时，唐刀默认 model.state 中每一个属性都有相对应的 action 并为其创建方法负责更新。以上例为示，唐刀在自动创建 reducers 时，会依据 model.state 的一级属性创建  setList、setTodoList、setLoadingStatus三个方法。自动创建的 reducers 属性方法全部以 set 作为前缀，遵守驼峰命名规则。

对于某些特殊的 state 属性, 你可以自己定义其更新方法，命名规则：以 set 作为前缀，遵守驼峰命名规则。那么唐刀在自动创建则会忽略该 state 属性，不为其创建更新方法。

**如果你的 model.state 不是 plainObject，而是被 Immutable 或者其他库处理过的，请在唐刀初始化的时候配置 stateToJS 属性，提供将其转换成普通对象的函数方法，例如：**

```javascript
import tangdao from '@maoyan/tangdao';

const app = tangdao({
  stateToJS(state) {
    return state.toJS();
  }
});
```

---

注：

updateState 函数的处理逻辑根据具体情况编写，并不局限于简单的更新赋值。

如果所有 model 的 updateState 都是一致的，updateState 可以放到唐刀的初始化中，但优先级低于 model 中的 updateState。

```javascript
import tangdao from '@maoyan/tangdao';

const app = tangdao({
  updateState(state, key, { payload }) {
    state[key] = payload;
    return state;
  }
})
```

**如果初始化配置或者 model 中没有 updateState 工厂函数，那么唐刀不会进行 reducers 的自动创建**