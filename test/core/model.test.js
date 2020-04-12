import tangdao, { useModel } from '../../src/index';

describe('register model', () => {
it('register model', function* () {
    const app = tangdao({});
    const model = {
      namespace: 'count',
      state: 0,
      init: function(actionType) {
        return {
          add: function(payload) {
            return {
              type: actionType.fetch,
              payload
            }
          }
        }
      },
      reducers: {
        add: function(state, { payload }) {
          return state + payload;
        }
      },
      effects: {
        * fetch( paylod, { put }, actionCreator) {
          yield put(actionCreator.add(1));
        }
      },
      subscriptions: {
        setup() {
         return function() {

         }
        }
      }
    }
    app.model([model]);
    const store = app.getStore();

    const { autoDispatch, actionTypes, actionCreator } = app;
    autoDispatch.count.add(2);
    expect(app.store.getState().count).toBe(2);
    store.dispatch(actionCreator.count.add(2));
    expect(app.store.getState().count).toBe(4);
    store.dispatch({
      type: actionTypes.count.add,
      payload: 1
    });
    expect(store.getState().count).toBe(5);
    autoDispatch.count.fetch(1, function() {
      // 测试 nextTick
      expect(store.getState().count).toEqual(undefined);
    });
    expect(store.getState().count).toBe(6);

    const { actionCreator: countActionCreator, actionType: countActionType, add } = useModel('count');
    store.dispatch(add(1));
    expect(store.getState().count).toBe(7);
    store.dispatch(countActionCreator.add(1));
    expect(store.getState().count).toBe(8);
    store.dispatch({
      type: countActionType.add,
      payload: 1
    });
    expect(store.getState().count).toBe(9);

    // 注入 model
    app.injectModel({
      namespace: 'countInject',
      state: -1,
      init: function(actionType, actionCreator) {
        return {
          decreaseMore: function() {
            return actionCreator.decrease(2);
          }
        }
      },
      reducers: {
        decrease: function(state, { payload }) {
          return state - payload;
        }
      },
      effects: {
        * fetch(payload, { put }, actionCreator) {
          yield put(actionCreator.decrease(-1))
        }
      }
    });
    store.dispatch({
      type: app.actionTypes.countInject.decrease,
      payload: 1
    });
    expect(store.getState().countInject).toBe(-2);
    store.dispatch(app.actionCreator.countInject.decrease(1));
    expect(store.getState().countInject).toBe(-3);
    app.autoDispatch.countInject.decrease(1);
    expect(store.getState().countInject).toBe(-4);

    const { actionCreator: injectAction, actionType: injectActionType, decreaseMore } = useModel('countInject');
    store.dispatch(decreaseMore());
    expect(store.getState().countInject).toBe(-6);
    store.dispatch(injectAction.decrease(1));
    expect(store.getState().countInject).toBe(-7);
    expect(injectActionType.decrease).toBe('countInject/decrease');

    app.autoDispatch.countInject.fetch();
    expect(store.getState().countInject).toBe(-6);

    // 替换 model
    app.replaceModel({
      namespace: 'count',
      state: 100,
      init: function(actionType, actionCreator) {
        return {
          mutil: function() {
            return actionCreator.mutil();
          }
        }
      },
      reducers: {
        mutil: function(state) {
          return state * 2;
        }
      }
    });

    store.dispatch({
      type: app.actionTypes.count.mutil,
      payload: 1
    });
    expect(store.getState().count).toBe(18);
    const { actionCreator: replaceAction, mutil } = useModel('count');
    store.dispatch(replaceAction.mutil());
    expect(store.getState().count).toBe(36);
    store.dispatch(mutil())
    expect(store.getState().count).toBe(72);


    // 卸载 model
    expect(() => {
      app.unmodel(1);
    }).toThrow();
    expect(() => {
      app.unmodel('count1');
    }).not.toThrow();
    app.unmodel('count');
  });
});
