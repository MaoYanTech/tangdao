// 没有提供 updateState 函数则不自动创建 reducer
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
      }
    }
    const countModel = {
      namespace: 'count',
      state: 0
    }
    const td = tangdao();
    td.model([todomModel, countModel]);
    td.getStore();
    const { actionType, autoDispatch } = useModel('todo');
    const { actionType: countActionType, autoDispatch: countAutoDispatch } = useModel('count');
    expect(actionType).toEqual({});
    expect(autoDispatch).toEqual({});
    expect(countAutoDispatch).toEqual({});
    expect(countActionType).toEqual({});
  });
})