import { nextTick } from './nextTick';
import { isFunction } from '../../utils';

const nextTickMap = Object.create({});

export default {
  effectHooks: {
    start: function(effectAPI, model, action) {
      const { callback, type } = action;
      // 查看该 actionType 下是否需要注册 callback
      if (!isFunction(callback)) {
        return;
      }
      // 注册 tick
      const tickObj = {
        id: Date.now(),
        callback: callback
      };
      if (type in nextTickMap) {
        nextTickMap[type].push(tickObj);
      } else { // 可能同一个 action 下注册多个 callback
        nextTickMap[type] = [tickObj]
      }
      action['@tangdao_tick_id'] = tickObj.id;
    },
    end: function(effectAPI, model, action) {
      const tickId = action['@tangdao_tick_id'];
      const actionType = action.type;

      // 如果该 actionType 注册了 callback
      if (tickId && actionType in nextTickMap) {
        let tickList = nextTickMap[actionType];
        let targetTick;

        // 根据 id 取出注册时的 callback，同时从 list 中删除掉
        tickList = tickList.filter( item => {
          if (item.id === tickId) {
            targetTick = item;
            return false;
          } else {
            return true;
          }
        })

        // 如果该 actionType 下注册的 callback 都已经取出，那么从 nextTickMap 中删除
        if(tickList.length === 0) {
          delete nextTickMap[actionType];
        } else {
          nextTickMap[actionType] = tickList;
        }
        // 将 注册的 callback 放入 nextTick 中
        targetTick && nextTick(targetTick.callback);
      }
    }
  }
}