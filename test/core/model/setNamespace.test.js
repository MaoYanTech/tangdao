import create from '../../../src/index'
import { setNamespace } from '../../../src/core/model/setNamespace';

describe('setNamespace', () => {
  const app = create();
  it('reducer namespace', () => {
    const model = {
      namespace: 'count',
      state: '',
      reducers: {
        add: function () {
          return 1;
        },
        $$sum: function() {

        }
      }
    }
    const namespaceModel = setNamespace(model, app);
    const expectObj = {
      namespace: 'count',
      state: '',
      reducers: {
        'count/add': function add() {
          return 1;
        }
      },
      reducerTypes: ['add', 'sum'],
      actionCreator: {
        add: function anonymous(payload) {
          return {
            type: 'count/add',
            payload
          }
        },
        sum: function(payload) {
          return {
            type: 'sum',
            payload
          }
        }
      },
      actionTypes: {
        add: 'count/add',
        sum: 'sum'
      }
    };

    expect(namespaceModel.reducerTypes).toEqual(expectObj.reducerTypes);
    expect(namespaceModel.actionTypes).toEqual(expectObj.actionTypes);
    expect(namespaceModel.actionCreator.add()).toEqual(expectObj.actionCreator.add());
    expect(namespaceModel.actionCreator.sum()).toEqual(expectObj.actionCreator.sum());
    expect(namespaceModel.reducers['count/add']()).toEqual(expectObj.reducers['count/add']());
  });
  it('effects namespace', () => {
    const model = {
      namespace: 'count',
      state: '',
      effects: {
        add: function () {
          
        },
        $$sum: function() {

        }
      }
    }
    const namespaceModel = setNamespace(model, app);
    const expectObj = {
      namespace: 'count',
      state: '',
      effects: {
        'count/add': function() {

        }
      },
      reducerTypes: undefined,
      actionTypes: {
        add: 'count/effect/add',
        sum: 'sum'
      },
      actionCreator: {
        add: function(payload) {
          return {
            type: 'count/effect/add',
            payload
          }
        }
      }
    };

    expect(namespaceModel.reducerTypes).toEqual(expectObj.reducerTypes);
    expect(namespaceModel.actionTypes).toEqual(expectObj.actionTypes);
    expect(namespaceModel.effects['count/effect/add']).toBeDefined();
    expect(namespaceModel.actionCreator.add(1)).toEqual(expectObj.actionCreator.add(1));
  });
  it('model is global actionType', () => {
    const model = {
      namespace: '$$request',
      LOADING: 'REQUEST_LODING'
    }
    const namespaceModel = setNamespace(model, app);
    const expectModel = {
      namespace: '$$request',
      LOADING: 'REQUEST_LODING',
      actionTypes: {
        LOADING: 'REQUEST_LODING'
      },
      actionCreator: {
        LOADING: function(payload) {
          return {
            type: 'REQUEST_LODING',
            payload
          }
        }
      },
      reducerTypes: undefined
    }
    expect(namespaceModel.LOADING).toBe(expectModel.LOADING);
    expect(namespaceModel.actionTypes).toEqual(expectModel.actionTypes);
    expect(namespaceModel.actionCreator.LOADING(1)).toEqual(expectModel.actionCreator.LOADING(1));
    expect(namespaceModel.reducerTypes).toEqual(expectModel.reducerTypes);
  });
})