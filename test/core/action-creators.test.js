import actionCreators from '../../src/core/action-creators';

describe('actionCreators', () => {
  it('create actionCreators', () => {
    const allActionTypes = {
      'count': {
        'add': function(payload) {
          return {
            type: 'add',
            payload
          }
        }
      }
    };
    const dispatch = jest.fn();
    const action = actionCreators(allActionTypes, dispatch);
    const addDispatch = action.count.add(1);
    expect(dispatch).toHaveBeenCalled();
  })
})