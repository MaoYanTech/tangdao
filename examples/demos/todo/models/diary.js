const diary = {
  namespace: 'diary',
  state: {},
  reducers: {
    list: function(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    deleteItem: function(state, { payload }) {
      const id = payload.id;
      return {
        list: state.list.filter((item) => {
          return item.id !== id;
        })
      }
    },
    unfold: function(state, { payload }) {
      return {
        list: state.list.map((item) => {
          item.unfold = +item.id === +payload.id;
          return item;
        })
      }
    }
  },
  effects: {
    * fetchList(payload, { put }, actionCreator) {
      const diaryList = yield mockFetch.getDiary();
      if (diaryList && diaryList.status === 0 && diaryList.data.length !== 0) {
        yield put(actionCreator.list({
          list:diaryList.data
        }))
      } else {
        yield put(actionCreator.list({
          list: []
        }))
      }
    },
    * deleteDiaryItem({ payload }, { put }, actionCreator) {
      yield mockFetch.deleteDiary(payload);
      yield put(actionCreator.deleteItem(payload));
    }
  }
}

export default diary;