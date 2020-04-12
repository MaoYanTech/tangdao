import create from '../../src/index';

describe('get global error', () => {
  const onError = function() {
    // console.log(err, dispatch, extension);
  };
  const app = create({
    onError: onError
  });
  app.model({
    namespace: 'count',
    state: 0,
    reducers: {
      add: function(state) {
        return state + 1;
      }
    },
    effects: {
      * fetch({ payload }, { put }, actionCreator) {
        payloadA += 1;
        put(actionCreator.add(payload))
      }
    }
  });
  const store = app.getStore();
  it('hold error', () => {
    expect(() => {
      store.dispatch({
        type: 'count/fetch'
      })
    }).not.toThrow();
  })
})