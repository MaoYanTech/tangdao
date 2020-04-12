import create from '../../src/index';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

describe('effect', () => {
  it('type: throttle', done => {
    const app = create();
    app.model({
      namespace: 'count',
      state: {
        throttle: 0,
        latest: 0,
        custom: 0
      },
      reducers: {
        throttle(state, { payload }) {
          return {
            ...state,
            throttle: state.throttle + payload || 1
          }
        },
        latest(state, { payload }) {
          return {
            ...state,
            latest: state.latest + payload || 1
          }
        },
        custom(state, { payload }) {
          return {
            ...state,
            custom: state.custom + payload || 1
          }
        }
      },
      effects: {
        addDelay: [
          function*({ payload }, { call, put }) {
            yield call(delay, 100);
            yield put({ type: 'count/throttle', payload });
          },
          { type: 'throttle', ms: 100 }
        ],
        addLatest: [
          function*({ payload }, { call, put }) {
            yield call(delay, 100);
            yield put({ type: 'count/latest', payload });
          },
          { type: 'takeLatest'}
        ],
        addCustom: [
          function*({ put, takeEvery }) {
            return function* () {
              yield takeEvery('addcustom', function* (payload) {
                yield put({ type: 'count/custom' }, payload || 1 );
              })
            }
          },
          { type: 'custom'}
        ]
      }
    });
    app.getStore();

    // Only catch the last one.
    app.store.dispatch({ type: 'count/effect/addDelay', payload: 2 });
    app.store.dispatch({ type: 'count/effect/addDelay', payload: 3 });

    app.store.dispatch({ type: 'count/effect/addLatest', payload: 2 });
    app.store.dispatch({ type: 'count/effect/addLatest', payload: 3 });

    app.store.dispatch({ type: 'count/effect/custom', payload: 3 });

    setTimeout(() => {
      expect(app.store.getState().count.throttle).toEqual(2);
      expect(app.store.getState().count.latest).toEqual(3);
      expect(app.store.getState().count.custom).toEqual(3);
      done();
    }, 200);
  });
})