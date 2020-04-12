const trash = {
  namespace: 'trash',
  state: {},
  reducers: {
    setList: function(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    restoreTrashItem: function(state, { payload }) {
      return {
        ...state,
        list: state.list.filter(item => {
          return item.id !== payload.id;
        })
      }
    }
  },
  effects: {
    * fetchList(payload, { put }, actionCreator) {
      const reply = yield mockFetch.getTrashDiary();
      let list =  [];
      if (reply && reply.status === 0) {
        list = reply.data;
      }
      yield put(actionCreator.setList({list: list}))
    },
    * restore( { payload }, { put }, actionCreator) {
      const reply = yield mockFetch.restore(payload);
      if (reply && reply.status === 0) {
        yield put(actionCreator.restoreTrashItem(payload));
      }
    }
  }
}

export default trash;