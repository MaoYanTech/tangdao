import { bindActionCreators } from 'redux';

export default function actionCreators(allActionTypes, dispatch) {
  const actionCreatorsMap = {};
  for (let namespace in allActionTypes) {
    if (Object.prototype.hasOwnProperty.call(allActionTypes, namespace)) {
      const actionMap = allActionTypes[namespace];
      actionCreatorsMap[namespace] = {};
      for (let actionType in actionMap) {
        if (Object.prototype.hasOwnProperty.call(actionMap, actionType)) {
          actionCreatorsMap[namespace][actionType] = bindActionCreators(actionMap[actionType], dispatch);
        }
      }
    }
  }
  return actionCreatorsMap;
}