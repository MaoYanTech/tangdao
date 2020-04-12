#### Dva 项目接入唐刀

---

**注意事项**

由于唐刀与 Dva 十分相似，并且唐刀尽可能提供了 Dva 大部分 api，但是并不能完美替代 Dva，以下功能唐刀并没有提供或者进行了一些修改

未提供功能

- 动态组件 **dynamic**
- model 中定义 effects ，以数组格式配置取消了 watcher type，详情请见 [核心概念/model](http://doc-movie.sankuai.com/product/tangdao/model) 文档

- 创建应用时的可配属性，详情请见 [核心概念/初始化配置](http://doc-movie.sankuai.com/product/tangdao/initConfig) 文档

```
{
    onHmr // 被删除，不支持该可配属性
    onEffect // 修改为 effectHooks
    onReducer // 修改为 wrapReducer
    onAction // 修改为 extraMiddleware	
}
```

- 输出文件 dva/router、 dva/fetch、dva/saga 、dva-loading 等的引用方式修改

```
    import { Router, Route, routerRedux } from '@maoyan/tangdao';
    import { call } from '@maoyan/tangdao';
    import { loading } from '@maoyan/tangdao';
```

loading 的可配参数，详情请见 [loading 插件](http://doc-movie.sankuai.com/product/tangdao/loading)

---

**安装**

```javascript
npm install @maoyan/tangdao --sava
```

---

**初步接入**

将从 dva 中引入的 api 替换为唐刀，在应用的创建流程上，唐刀提供了与 Dva 相同的 api 和流程。

以下面代码作为 Dva 接入案例

```javascript
import dva from 'dva';
import createLoading from 'dva-loading';

const app = dva();

app.use(createLoading({ effects: true }));

app.model(model);

app.router(require('./router').default);

app.start('#app');
```

接入唐刀

```javascript
import React from 'react';
import tangdao, {loading} from '@maoyan/tangdao';

// 1. Initialize
const app = tangdao();

// 2. Plugins
app.use(loading({ effects: true }));

// 3. Model
app.model(model);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#app');
```

 然后将从 dva 中引用的 api 全部改为唐刀引入。

至此，你已经完成了唐刀的初步对接，接入过程如果报错，请移步 [迁移问题总结](http://doc-movie.sankuai.com/product/tangdao/summary)

---

**action 相关**

因为 Dva 不支持 action 管理，而唐刀支持 action 管理，这一部分根据项目规范并参考 [核心概念/action 管理](http://doc-movie.sankuai.com/product/tangdao/action-manage) 自行改造

---

**测试**

对具体 model 的改造完成后，通过测试即可上线
