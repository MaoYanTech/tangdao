const activeMenu = {
  namespace: 'activeMenu',
  state: {
    title: '新增',
    id: 0,
    active: true
  },
  reducers: {
    switchMenu: function(state, action) {
      const payload = action.payload;
      return {
        ...payload,
        active: true
      }
    }
  }
}
export default activeMenu;