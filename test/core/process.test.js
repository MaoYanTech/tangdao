// 流程测试

import tangdao, { useModel } from '../../src/index';

describe('injection all models', () => {
  const app = tangdao();
  const count = {
    namespace: 'count',
    state: 0,
    reducers: {
      add: function (state, { payload }) {
        return state + payload;
      }
    }
  };
  const count2 = {
    namespace: 'count2',
    state:  0,
    reducers: {
      add: function (state, { payload }) {
        return state + payload;
      }
    }
  };
  const count3 = {
    namespace: 'count3',
    state: 0,
    reducers: {
      add: function (state, { payload }) {
        return state + payload;
      }
    }
  };
  const count4 = {
    namespace: 'count4',
    state: 0,
    reducers: {
      add: function (state, { payload }) {
        return state + payload;
      }
    }
  };
  const count5 = {
    namespace: 'count5',
    state: 0,
    reducers: {
      add(state, { payload }) {
        return state + payload;
      }
    }
  };
  it('one time injection all models', () => {
    app.model([count, count2]);
    const countDispatch = useModel('count').dispatch;
    const count2Dispatch = useModel('count2').dispatch;
    countDispatch.add(2);
    count2Dispatch.add(3);
    const state = app.getStore().getState();
    expect(state.count).toBe(2);
    expect(state.count2).toBe(3);
  });
  it('multiple injection all models', () => {
    app.model([count3, count4]);
    const countDispatch = useModel('count').dispatch;
    const count2Dispatch = useModel('count2').dispatch;
    const count3Dispatch = useModel('count3').dispatch;
    const count4Dispatch = useModel('count4').dispatch;
    countDispatch.add(2);
    count2Dispatch.add(3);
    count3Dispatch.add(2);
    count4Dispatch.add(3);
    const state = app.getStore().getState();
    expect(state.count).toBe(4);
    expect(state.count2).toBe(6);
    expect(state.count3).toBe(2);
    expect(state.count4).toBe(3);
  });
  it('multiple injection all models', () => {
    app.model([count5]);
    const countDispatch = useModel('count').dispatch;
    const count2Dispatch = useModel('count2').dispatch;
    const count3Dispatch = useModel('count3').dispatch;
    const count4Dispatch = useModel('count4').dispatch;
    const count5Dispatch = useModel('count5').dispatch;
    countDispatch.add(2);
    count2Dispatch.add(3);
    count3Dispatch.add(2);
    count4Dispatch.add(3);
    count5Dispatch.add(3);
    const state = app.getStore().getState();
    expect(state.count).toBe(6);
    expect(state.count2).toBe(9);
    expect(state.count3).toBe(4);
    expect(state.count4).toBe(6);
    expect(state.count5).toBe(3);
  });
  it('unModel count', () => {
    app.unmodel('count');
    const store = app.getStore();
    const dispatch = store.dispatch;
    dispatch({
      type: 'count/add',
      payload: 1
    });
    const state = store.getState();
    const countModel = useModel('count');
    const autoDispatch = app.autoDispatch.count;
    const actionType = app.actionTypes.count;
    const actionCreator = app.actionCreator.count;
    expect(countModel).toBe(undefined);
    expect(autoDispatch).toBe(undefined);
    expect(actionType).toBe(undefined);
    expect(actionCreator).toBe(undefined);
    expect(state.count).toBe(undefined);
  });
  it('replace model count', () => {
    const count = {
      namespace: 'count2',
      state: 0,
      reducers: {
        doubleAdd: function (state, { payload }) {
          return state + payload * 2;
        }
      }
    };
    app.replaceModel(count);
    const count2Dispatch = useModel('count2').dispatch;
    const count3Dispatch = useModel('count3').dispatch;
    const count4Dispatch = useModel('count4').dispatch;
    const count5Dispatch = useModel('count5').dispatch;
    count2Dispatch.doubleAdd(3);
    count3Dispatch.add(2);
    count4Dispatch.add(3);
    count5Dispatch.add(3);
    const state = app.getStore().getState();
    expect(count2Dispatch.add).toBe(undefined);
    expect(state.count2).toBe(15);
    expect(state.count3).toBe(6);
    expect(state.count4).toBe(9);
    expect(state.count5).toBe(6);
  });
})