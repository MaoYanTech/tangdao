- 介绍
  - [快速开始](https://maoyantech.github.io/tangdao/introduction/getting-started)
  - 初始化顺序
  - [默认输出](https://maoyantech.github.io/tangdao/introduction/default-output)
  - [为什么选择唐刀](https://maoyantech.github.io/tangdao/introduction/why)
- [核心概念](https://maoyantech.github.io/tangdao/core-concepts/index)
- [插件列表](https://maoyantech.github.io/tangdao/plugins/index)
- [API 列表](https://maoyantech.github.io/tangdao/api-reference/index)
- [迁移指南](https://maoyantech.github.io/tangdao/migration-guide/index)

唐刀为应用的初始化提供了一套严谨有序的初始化步骤和规范，请认真阅读并严格按照要求进行开发。

### 第一步：创建实例

```javascript
// /index.js
import tangdao from '@maoyan/tangdao';

// 创建应用实例
const td = tangdao({});
```

### 第二步：挂载插件

这一步根据实际情况出发，唐刀在内部已经为开发者引入了必要的插件。如果你没有额外的插件使用需求，那么可以跳过这一步。

```javascript
// /index.js
import tangdao, { loading } from '@maoyan/tangdao';

// 第一步 创建应用实例
const td = tangdao({});

// 第二步 创建应用实例
td.use(loading);
```

### 第三步：注册 model

这一步负责批量注册 model 和创建 ``redux store``，需要开发者一次性将所有的 model 以一维数组的形式传入进行注册。如果你只需要批量注册 model 不创建 ``redux store`` ，那么可以使用 ``patchModel`` 方法。

```javascript
// /index.js
import tangdao, { loading } from '@maoyan/tangdao';
import models from './models';

// 第一步 创建应用实例
const td = tangdao({});

// 第二步 创建应用实例
td.use(loading);

// 第三步 注册 model
td.model(models);
```

### 第四步：注册路由组件

路由组件的注册一定要放在 ``td.model`` 方法后使用，并且要使用 ``td.router(require('xxx').default)`` 这种方式注册，否则  ``useModel``、 ``dispatch``、 `actionType`、 ``actionCreator`` 的使用会出现 ``undefined`` 问题。

```javascript
// /index.js
import tangdao, { loading } from '@maoyan/tangdao';
import models from './models';

// 第一步 创建应用实例
const td = tangdao({});

// 第二步 创建应用实例
td.use(loading);

// 第三步 注册 model
td.model(models);

// 第四步 注册 路由
td.router(require('./router').default); // 请一定按照此方法引入组件！！！
```

### 第五步：挂载组件，启动应用

```javascript
// /index.js
import tangdao, { loading } from '@maoyan/tangdao';
import models from './models';

// 第一步 创建应用实例
const td = tangdao({});

// 第二步 创建应用实例
td.use(loading);

// 第三步 注册 model
td.model(models);

// 第四步 注册 路由
td.router(require('./router').default); // 请一定按照此方法引入组件！！！

// 启动应用
td.start('#app')
```
