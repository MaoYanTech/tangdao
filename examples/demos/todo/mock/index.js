const database = {};

const db = {
  apendData: function(collection, data) {
    this.addData(collection, data);
  },
  getData: function(collection) {
    const storageItem = localStorage.getItem(collection) || null;
    return JSON.parse(storageItem);
  },
  addData: function(collection, data) {
    let storageItem = this.getData(collection);
    if (storageItem) {
      storageItem.push(data) 
    }else {
      storageItem = [data];
    }
    localStorage.setItem(collection, JSON.stringify(storageItem));
  },
  setData: function(collection, data) {
    localStorage.setItem(collection, JSON.stringify(data));
  }
}

const mock = {
  appendDiary: function(data) {
    return new Promise((resolve, reject) => {
      db.apendData('diary', data);
      setTimeout(() => {
        resolve({
          status: 0,
          message: "ok",
          data: []
        })
      }, 2000)
    })
  },
  deleteDiary: function(data) {
    return new Promise((resolve, reject) => {
      let allDiary = db.getData('diary');
      allDiary = allDiary.filter(item => {
        return +data.id !== item.id
      });
      db.setData('diary', allDiary);
      db.addData('trash_diary', data);
      setTimeout(() => {
        resolve({
          status: 0,
          message: "ok",
          data: []
        })
      }, 2000)
    })
  },
  getDiary: function() {
    return new Promise((resolve, reject) => {
      const diary =  db.getData('diary') || [];
      setTimeout(() => {
        resolve({
          status: 0,
          message: "ok",
          data: diary
        })
      }, 2000)
    })
  },
  getTrashDiary: function() {
    return new Promise((resolve, reject) => {
      const trashDiary =  db.getData('trash_diary') || [];
      setTimeout(() => {
        resolve({
          status: 0,
          message: "ok",
          data: trashDiary
        })
      }, 2000)
    })
  },
  restore: function(data) {
    return new Promise((resolve, reject) => {
      let trashDiary =  db.getData('trash_diary') || [];
      trashDiary = trashDiary.filter(item => {
        return item.id !== data.id;
      })
      db.setData('trash_diary', trashDiary);
      db.apendData('diary', data);
      setTimeout(() => {
        resolve({
          status: 0,
          message: "ok",
          data: trashDiary
        })
      }, 2000)
    })
  }
}

window.mockFetch = mock;