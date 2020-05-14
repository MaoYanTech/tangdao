import { create } from './core/create';

export { dispatch, actionCreator, actionType } from './core/create';
export * from 'connected-react-router';
export { loading } from './plugins/loading/loading';
export fetch from 'isomorphic-fetch';
export * from 'react-router-dom';
export { nextTick } from './core/next-tick/next-tick';
export { getApp, useModel } from './core/create';
export * from 'react-redux';
export * from 'redux-saga';
export * from 'redux-saga/effects';
// 入口函数
export default function td(options = {}) {
  const app = create(options);
  return app;
}
