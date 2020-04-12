
import {isNative, isIE} from'../../utils';

const callback = [];
let pending = false;

function flushCallbacks(){
    pending = false;
    const copies = callback.slice(0);
    callback.length = 0;
    for (let i = 0; i < copies.length; i++) {
        copies[i]()
    }
}

export function getTimerFunc(flushCallbacks){
  let timerFunc;
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    const p = Promise.resolve()
    timerFunc = () => {
      p.then(flushCallbacks)
    }
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
      isNative(MutationObserver) ||
      MutationObserver.toString() === '[object MutationObserverConstructor]'
    )) {
      let counter = 1
      const observer = new MutationObserver(flushCallbacks)
      const textNode = document.createTextNode(String(counter))
      observer.observe(textNode, {
        characterData: true
      })
      timerFunc = () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter)
      }
  }else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
      timerFunc = () => {
        setImmediate(flushCallbacks)
      }
  } else {
      timerFunc = () => {
        setTimeout(flushCallbacks, 0)
      }
  }
  return timerFunc;
}



export function nextTick(cb, ctx){
    if(typeof cb !== 'function'){
        console.error('nextTick 期待传入一个函数');
        return;
    }
    let _resolve;
    callback.push(()=>{
        if (cb) {
            try {
              cb.call(ctx)
            } catch (e) {
              console.error(e, ctx, 'nextTick')
            }
          } else if (_resolve) {
            _resolve(ctx)
          }
    });
    if(!pending){
        pending = true;
        getTimerFunc(flushCallbacks)();
    }

    if (!cb && typeof Promise !== 'undefined') {
        return new Promise(resolve => {
            _resolve = resolve
        })
    }
}