import activeMenu from './activeMenu';
import todayDiary from './todayDiary';
import diary from './diary';
import trash from './trash';

export default function initModel(model) {
  model([activeMenu,todayDiary, diary, trash]);
}