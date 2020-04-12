// reducer 自动创建
import tangdao, { useModel } from '../../../../src/index';

describe('auto create reducer', () => {
it('own updateState', () => {
    const todomModel = {
      namespace: 'todo',
      state: {
        list: [],
        pageConfig: {
          page: 0,
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
    const countModel = {
      namespace: 'count',
      state: 0
    }
    const td = tangdao({
      updateState: function(state, key, { payload }) {
        state[key] = payload;
        return state;
      }
    })
    td.model([todomModel, countModel]);
    const store = td.getStore();
    const { actionType, autoDispatch } = useModel('todo');
    const { actionType: countActionType, autoDispatch: countAutoDispatch } = useModel('count');
    autoDispatch.setList([1, 2, 3]);
    autoDispatch.setPageConfig(2);
    autoDispatch.setPageConfig(10);
    expect(store.getState().todo.list[0]).toBe(1);
    expect(store.getState().todo.pageConfig.page).toBe(12);
    expect(actionType.setList).toBe('todo/setList');
    expect(actionType.setPageConfig).toBe('todo/setPageConfig');
    expect(JSON.stringify(countActionType)).toBe('{}');
    expect(JSON.stringify(countAutoDispatch)).toBe('{}');
  });
})