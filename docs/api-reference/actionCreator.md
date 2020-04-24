- [介绍](https://maoyantech.github.io/tangdao/introduction/index)
- [核心概念](https://maoyantech.github.io/core-concepts/index)
- [插件列表](https://maoyantech.github.io/tangdao/plugins/index)
- API 列表
  - [tangdao(opts)](https://maoyantech.github.io/tangdao/api-reference/tangdao(opts))
  - [dispatch](https://maoyantech.github.io/tangdao/api-reference/dispatch)
  - [actionType](https://maoyantech.github.io/tangdao/api-reference/actionType)
  - actionCreator
  - [useModel](https://maoyantech.github.io/tangdao/api-reference/use-model)
  - [nextTick](https://maoyantech.github.io/tangdao/api-reference/next-tick)
  - [getApp](https://maoyantech.github.io/tangdao/api-reference/get-app)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide/index)

通过 ``.`` 的获取具体 model 下的 actionCreator，具体如下：

**model**

```javascript
const count = {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state, { payload }) {
      return state + payload;
    }
  }，
  effects: {
    * asyncAdd({ payload }, { put }, actionCreator) {
      yield new Promise(resolve => setTimeout(resolve, 1000));
      yield put(actionCreator.add(payload));
    }
  }
}

```

**组件**

```javascript
import React from 'react';
import { connect, actionCreator } from '@maoyan/tangdao';

console.log(actionCreator);
/* 输出
{
  add: function(payload) {
  	return {
  		type: 'count/add',
  		payload
  	}
  },
  asyncAdd: function(payload){
    return {
      type: 'count/effect/asyncAdd',
      payload
    }
  }  
}
/*
```

