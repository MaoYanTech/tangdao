// registerReducer 单元测试
import { registerReducer } from '../../../../src/core/model';

describe('single registerReducer test', () => {
it('update is function', () => {
    const todo = {
      namespace: 'todo',
      state: {
        list: [],
        pageConfig: {
          page: 1,
          limit: 10
        }
      },
      reducers: {
        setPageConfig(state, { payload }) {
          const page = state.pageConfig.page + payload;
          return {
            ...state,
            pageConfig: {
              limit: 10,
              page
            }
          }
        }
      }
    }
    const updateState = (state, key, payload) => {
      state[key] = payload;
      return state;
    }
    registerReducer(todo, updateState);
    todo.reducers.setList(todo.state, [1, 3, 4]);
    const todoState = todo.reducers.setPageConfig(todo.state, { payload: 4 });
    expect(todoState.list[2]).toBe(4);
    expect(todoState.pageConfig.page).toBe(5);

    const count = {
      namespace: 'count',
      state: {
        count: 0
      }
    }
    registerReducer(count, updateState);
    const countState = count.reducers.setCount(count.state, 1)
    expect(countState.count).toBe(1);
  });
it('updateState is not function', () => {
    expect(() => {
      registerReducer({}, {});
    }).toThrow();
  })
it('don`t provider updateState function', () => {
    expect(() => {
      registerReducer({}, null);
    }).not.toThrow();
  })
it('state is not object', () => {
    expect(() => {
      registerReducer({}, null);
    }).not.toThrow();
  })
  it('model updateState', () => {
    const updateState = () => {
      return 1;
    }
    const todo = {
      namespace: 'todo',
      state: {
        list: [],
        pageConfig: {
          page: 1,
          limit: 10
        }
      },
      updateState(state, key, payload) {
        state[key] = payload;
        return state;
      },
      reducers: {
        setPageConfig(state, { payload }) {
          const page = state.pageConfig.page + payload;
          return {
            ...state,
            pageConfig: {
              limit: 10,
              page
            }
          }
        }
      }
    };
    registerReducer(todo, updateState);
    todo.reducers.setList(todo.state, [1, 3, 4]);
    const todoState = todo.reducers.setPageConfig(todo.state, { payload: 4 });
    expect(todoState.list[2]).toBe(4);
    expect(todoState.pageConfig.page).toBe(5);
  })
  it('model updateState', () => {
    const updateState = () => {
      return 1;
    }
    const todo = {
      namespace: 'todo',
      state: {
        list: [],
        pageConfig: {
          page: 1,
          limit: 10
        }
      },
      updateState: 1
    };
    expect(() => {
      registerReducer(todo, updateState);
    }).toThrow();
  })
})
