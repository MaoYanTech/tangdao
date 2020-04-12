// reducer 自动创建
import tangdao from '../../../../src/index';

it('updateState is not function', () => {
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
  expect(() => {
    const td = tangdao({
      updateState: {}
    })
    td.model([todomModel]);
  }).toThrow();
});