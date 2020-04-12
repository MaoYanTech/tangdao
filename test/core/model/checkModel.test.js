import { checkModel } from '../../../src/core/model/checkModel';

describe('checkModel', () => {
  it('[app.model]  should be plainObject', () => {
    expect(() => {
      checkModel('', [])
    }).toThrow('[app.model]  should be plainObject');
  });

  it('global type', () => {
    expect(() => {
      checkModel({namespace: '$$count', reducers: {}, effects: {}}, [])
    }).toThrow();
    expect(() => {
      checkModel({namespace: '$$count', reducers: {}}, [])
    }).toThrow();
    expect(() => {
      checkModel({namespace: '$$count', effects: {}}, [])
    }).toThrow();
    expect(() => {
      checkModel({namespace: '$$count'}, [])
    }).not.toThrow();
  })

  it('[app.model] namespace should be defined', () => {
    expect(() => {
      checkModel({}, [])
    }).toThrow('[app.model] namespace should be defined');
  });

  it('[app.model] namespace should be string', () => {
    expect(() => {
      const model = {
        namespace: 0
      };
      checkModel(model, []);
    }).toThrow();
  });

  it('model.namespace should to be uniqe', () => {
    expect(() => {
      const model = {
        namespace: 'count'
      };
      const exsitModel = {
        namespace: 'count'
      }
      checkModel(model, [exsitModel]);
    }).toThrow()
  });

  it('注册公共 actionType 不能有 reducers 属性和 effects 属性', () => {
    expect(() => {
      const model = {
        namespace: '$$request',
        reducers: true,
        effects: true
      }
      checkModel(model, []);
    }).toThrow();
  });

  it('[app.model] init should be Function', () => {
    expect(() => {
      const model = {
        namespace: 'count',
        init: {}
      }
      checkModel(model, []);
    }).toThrow();
  });

  it('[app.model] reducers can be array', () => {
    expect(() => {
      const model = {
        namespace: 'count',
        reducers: [{}, () => {}]
      }
      checkModel(model, []);
    }).not.toThrow();
  });

  it('[app.model] reducers can be object', () => {
    expect(() => {
      const model = {
        namespace: 'count',
        reducers: {}
      }
      checkModel(model, []);
    }).not.toThrow();
  });

  it('[app.model] reducers should be plain object or array', () => {
    expect(() => {
      const model = {
        namespace: 'count',
        reducers: function() {

        }
      }
      checkModel(model, []);
    }).toThrow();
  });

  describe('[app.model] reducers with array should be [Object, Function]', () => {
    it('[app.model] reducers with array should be [Object, Function]', () => {
      expect(() => {
        const model = {
          namespace: 'count',
          reducers: [{}, 1]
        }
        checkModel(model, []);
      }).toThrow();
    });

    it('[app.model] reducers with array should be [Object, Function]', () => {
      expect(() => {
        const model = {
          namespace: 'count',
          reducers: [1, function(){}]
        }
        checkModel(model, []);
      }).toThrow();
    });

    it('[app.model] reducers with array should be [Object, Function]', () => {
      expect(() => {
        const model = {
          namespace: 'count',
          reducers: [1, 1]
        }
        checkModel(model, []);
      }).toThrow();
    });
  });

  describe('[app.model] effects should be plain object', () => {
    it('[app.model] effects should be plain object', ()=> {
      expect(() => {
        const model = {
          namespace: 'count',
          reducers: {
  
          },
          effects: []
        }
        checkModel(model, []);
      }).toThrow();
    });
    it('[app.model] effects should be plain object', ()=> {
      expect(() => {
        const model = {
          namespace: 'count',
          reducers:  {
  
          },
          effects: {

          }
        }
        checkModel(model, []);
      }).not.toThrow();
    })
  });

  it('[app.model] subscriptions should be plain object', () => {
    expect(() => {
      const model = {
        namespace: 'count',
        reducers: {},
        effects: {},
        subscriptions: function() {

        }
      }
      checkModel(model, []);
    }).toThrow();
  })
  it('[app.model] subscriptions value should be Function', () => {
    expect(() => {
      const model = {
        namespace: 'count',
        reducers: {},
        effects: {},
        subscriptions: {
          a: 1,
          b: 2
        }
      }
      checkModel(model, []);
    }).toThrow();
  })
})