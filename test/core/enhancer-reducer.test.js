import create from '../../src/index';

describe('reducer 相关检查', () => {
  it('enhancer and extra reducer', () => {
    function enhancer(reducer) {
      return (state, action) => {
        if (action.type === 'count/square') {
          return state * state;
        }
        return reducer(state, action);
      };
    };
    const extraReducer = {
      square: function(state = 9, action) {
        if (action.type === 'square') {
          return state * state;
        }
        return state;
      }
    }
    const app = create({
      extraReducers: extraReducer
    });
    app.model({
      namespace: 'count',
      state: 2,
      reducers: [{
        add: function(state, { payload }) {
          return state + payload;
        }
      }, enhancer]
    });
    const store = app.getStore();
    store.dispatch({ 
      type: 'count/add',
      payload: 1
    });
    expect(store.getState().count).toEqual(3);
    store.dispatch({
      type: 'square',
      payload: 1
    });
    expect(store.getState().square).toEqual(81);
    store.dispatch({
      type: 'count/square',
      payload: 1
    });
    expect(store.getState().count).toEqual(9);
  });
})