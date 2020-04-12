import { initOptions, mergeOptions, handleEffectHooksOptions, onError } from '../../src/core/options';

describe('mergeOptions', () => {
  describe('merge nothing', () => {
    const child = {
      history: null,
      initialState: null,
      onError: null,
      onStateChange: null,
      wrapReducer: null,
      extraReducers: null,
      extraEnhancers: null,
      extraMiddleware: null,
      extraSagas: null,
      effectHooks: null,
      effectThunk: null,
      updateState: null
    };
    mergeOptions(child, initOptions);
  })
  describe('merge children type function type', () => {
    it('options type is not function should throw error', () => {
      const options = {
        onError: 1
      }
      expect(() => {
        mergeOptions(options, initOptions)
      }).toThrow();
    });
    it('options type is function', () => {
      const options = {
        onError: () => {

        }
      }
      expect(() => {
        mergeOptions(options, initOptions);
      }).not.toThrow();
      expect(() => {
        mergeOptions(options, initOptions);
      }).not.toThrow();
    });
  });
  describe('merge children type  plainObject', () => {
    it('options is not plainObject should throw error', () => {
      const options = {
        initialState: () => {

        }
      }
      expect(() => {
        mergeOptions(options, initOptions)
      }).toThrow();
    });
    it('options is plainObject', () => {
      const options = {
        initialState: {
          a: 1
        }
      }
      expect(() => {
        mergeOptions(options, initOptions)
      }).not.toThrow();
      const mergedOptions = mergeOptions(options, initOptions);
      expect(mergedOptions.initialState).toEqual({
        a: 1
      });
      const childOptions = {
        initialState: {
          a: 5,
          b: 2
        }
      }
      const mergedMoreOptions = mergeOptions(childOptions, mergedOptions);
      expect(mergedMoreOptions.initialState).toEqual({
        a: 5,
        b: 2
      });
    });
  });
  describe('options children type is Array', () => {
    it('options children type is not Array should throw error', () => {
      const options = {
        extraSagas: 1
      }
      expect(() => {
        mergeOptions(options, initOptions);
      }).toThrow();
    });
    it('options children type is  Array', () => {
      const options = {
        extraSagas: [1]
      }
      expect(() => {
        mergeOptions(options, initOptions);
      }).not.toThrow();
      const mergedOptions = mergeOptions(options, initOptions);
      expect(mergedOptions.extraSagas).toEqual([1,1]);
      const childOptions = {
        extraSagas: [1,2]
      }
      const mergeMoreOptions = mergeOptions(childOptions, mergedOptions);
      expect(mergeMoreOptions.extraSagas).toEqual([1, 1, 1, 2]);
    })
  });
  describe('options extraMiddleware child', () => {
    it('extraMiddleware type is not array or function', () => {
      const baseOptions = {
        extraMiddleware: 1
      }
      expect(() => {
        mergeOptions(baseOptions, initOptions).toThrow();
      })
    })
    describe('extraMiddleware type is array or function', () => {
      it('extraMiddleware type is array', () => {
        const baseOptions = {
          extraMiddleware: [1]
        }
        expect(() => {
          mergeOptions(baseOptions, initOptions).not.toThrow();
        });
        const mergedOptions = mergeOptions(baseOptions, initOptions);
        expect(mergedOptions.extraMiddleware).toEqual([1]);
        const childOptions = {
          extraMiddleware: [1,2]
        }
        const mergedMoreOptions = mergeOptions(childOptions, mergedOptions);
        expect(mergedMoreOptions.extraMiddleware).toEqual([1,1,2]);
      });
      it('extraMiddleware type is function', () => {
        const baseOptions = {
          extraMiddleware: function() {
             
          }
        }
        expect(() => {
          mergeOptions(baseOptions, initOptions);
        }).not.toThrow();
      })
    });
  });
  
  describe('mult merge', () => {
    it('test merge function', () => {
      let parent = initOptions;
      const optionsA = {
        updateState: function() {
          return 1;
        },
        onError: function() {
          return 1;
        },
        onStateChange: function() {
          return 1;
        },
        wrapReducer: function() {
          return 1;
        }
      }
      const optionsB = {
        updateState: function() {
          return 2;
        },
        onError: function() {
          return 2;
        },
        onStateChange: function() {
          return 2;
        },
        wrapReducer: function() {
          return 2;
        }
      }
      const optionsC = {
        updateState: function() {
          return 3;
        },
        onError: function() {
          return 3;
        },
        onStateChange: function() {
          return 3;
        },
        wrapReducer: function() {
          return 3;
        }
      }
      parent = mergeOptions(optionsA, parent);
      parent = mergeOptions(optionsB, parent);
      parent = mergeOptions(optionsC, parent);
      expect(parent.updateState()).toBe(3);
      expect(parent.onError()).toBe(3);
      expect(parent.onStateChange()).toBe(3);
      expect(parent.wrapReducer()).toBe(3);
    });
    it('test merge history、 extraReducers、initialState', () => {
      let parent = initOptions;
      const optionsA = {
        extraReducers: {a: 1},
        initialState: {a: 1}
      };
      const optionsB = {
        history: {a: 1},
        extraReducers: {a: 2},
        initialState: {a: 2}
      }
      const optionsC = {
        history: {a: 2},
        extraReducers: {a: 3},
        initialState: {a: 3}
      }
      const optionsD = {
        history: 1
      }
      parent = mergeOptions(optionsA, parent);
      parent = mergeOptions(optionsB, parent);
      parent = mergeOptions(optionsC, parent);
      expect(() => { mergeOptions(optionsD, parent)}).toThrow();
      expect(parent.history.a).toBe(2);
      expect(parent.extraReducers.a).toBe(3);
      expect(parent.initialState.a).toBe(3);
    });
    it('test merge effectHooks、extraSagas、extraEnhancers', () => {
      let parent = initOptions;
      const optionsA = {
        effectHooks: [1],
        extraSagas: [1],
        extraEnhancers: [1]
      };
      const optionsB = {
        effectHooks: [2],
        extraSagas: [2],
        extraEnhancers: [2]
      }
      const optionsC = {
        effectHooks: [3],
        extraSagas: [3],
        extraEnhancers: [3]
      }
      parent = mergeOptions(optionsA, parent);
      parent = mergeOptions(optionsB, parent);
      parent = mergeOptions(optionsC, parent);
      expect(parent.effectHooks[parent.effectHooks.length - 1]).toBe(3);
      expect(parent.extraSagas[parent.extraSagas.length - 1]).toBe(3);
      expect(parent.extraEnhancers[parent.extraEnhancers.length - 1]).toBe(3);
    });
    it('test extraMiddleware', () => {
      let parent = {
        extraMiddleware: []
      };
      const optionsA = {
        extraMiddleware: [1]
      }
      parent = mergeOptions(optionsA, parent);
      expect(parent.extraMiddleware[0]).toBe(1);

      const optionsB = {
        extraMiddleware: null
      }
      parent = mergeOptions(optionsB, parent);
      expect(parent.extraMiddleware[0]).toEqual(1);

      const optionsC = {
        extraMiddleware: () => {
          return [2,3,4];
        }
      }
      parent = mergeOptions(optionsC, parent);
      expect(parent.extraMiddleware()[1]).toEqual(3);

      const optionsD = {
        extraMiddleware: [5, 6, 7]
      }
      parent = mergeOptions(optionsD, parent);
      expect(parent.extraMiddleware()[4]).toEqual(3);

      const optionsE = {
        extraMiddleware: () => {
          return [2,3,4];
        }
      }
      expect(() => {
        mergeOptions(optionsE, parent);
      }).toThrow();

      const optionsF = {
        extraMiddleware: {}
      }
      expect(() => {
        mergeOptions(optionsF, parent);
      }).toThrow();

    });
    it('test merge extral options', () => {
      let parent = {};
      const optionsA = {
        a: 1
      }
      parent = mergeOptions(optionsA, parent);
      expect(parent.a).toBe(1);
    })
  });
  describe('handleEffectHooksOptions', () => {
    it('effectHooks is empty', () => {
      const options = {
      
      }
      const mergedOptions = mergeOptions(options, {
        effectHooks: []
      })
      expect(handleEffectHooksOptions(mergedOptions)).toBe(undefined)
    });
    it('effectHooks exsit', function* (){
      const options = {
        effectHooks: [
          {
            start: function* (callback) {
              typeof callback === "function" && callback();
            },
            end: function* (callback) {
              typeof callback === "function" && callback();
            }
          }
        ]
      };
      const mergedOptions = mergeOptions(options, initOptions);
      handleEffectHooksOptions(mergedOptions);
      expect(mergedOptions.effectHooks.start).toBeDefined();
      expect(mergedOptions.effectHooks.end).toBeDefined();
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      yield mergedOptions.effectHooks.start(fn1);
      yield mergedOptions.effectHooks.end(fn2);
      expect(fn1).toBeCalled();
      expect(fn2).toBeCalled();
    })
  });
  describe('test onError', () => {
    const app = {
      store: { dispatch: () => {}},
      $options: {
        onError: () => {

        }
      }
    }
    const handleOnError = onError(app);
    expect(handleOnError()).toEqual(undefined);
    expect(() => {
      handleOnError({})
    }).not.toThrow();
    expect(() => {
      handleOnError('efarf');
    }).not.toThrow();
    const handleOnErrorA = onError({$options: {}});
    expect(() => {
      handleOnErrorA({})
    }).toThrow();
    expect(() => {
      const err = {};
      onError(app)(err)
      err.preventDefault()
    }).not.toThrow();
  });
  describe('test handleEffectHooksOptions', () => {
    it('effectHooks is empty', () => {
      const options = {
        effectHooks: []
      };
      expect(handleEffectHooksOptions(options)).toEqual(undefined);
    });
    it('effectHooks only with start', function* () {
      const fn1 = jest.fn();
      const options = {
        effectHooks: [
          {
            start: function* (callback) {
              typeof callback === "function" && callback();
            }
          }
        ]
      };
      handleEffectHooksOptions(options);
      yield options.effectHooks.start(fn1);
      expect(fn1).toBeCalled();
    })
    it('effectHooks only with end', function* () {
      const fn1 = jest.fn();
      const options = {
        effectHooks: [
          {
            end: function* (callback) {
              typeof callback === "function" && callback();
            }
          }
        ]
      };
      handleEffectHooksOptions(options);
      yield options.effectHooks.end(fn1);
      expect(fn1).toBeCalled();
    })
  })
})