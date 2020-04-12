import React from 'react';
import tangdao, { loading } from '@maoyan/tangdao';
import initModel from './models';
import App from './App';
import './mock';
import 'antd/dist/antd.css';
const td = tangdao({
  extraMiddleware: function(sagaMiddleware, historyMiddleware) {
    return [sagaMiddleware, historyMiddleware];
  }
});
initModel(td.model);
td.use(loading({
  delay: {
    duration: 2000,
    only: {
      model: ['diary'],
      action: ['trash/fetchList']
    }
  },
  only: {
    model: ['diary', 'trash'],
    action: ['trash/effect/fetchList']
  }
}));
td.router(() => {
  return <App />
})
td.start("#main");