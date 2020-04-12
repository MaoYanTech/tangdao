const todayDiary = {
  namespace: 'todayDiary',
  state: {},
  reducers: {
    $$add: function(state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  },
  effects: {
    * saveDiary({ payload }, { put }, actionCreator){
      yield mockFetch.appendDiary(payload);
      yield put(actionCreator.add(payload))
      return payload;
    }
  }
}
export default todayDiary;