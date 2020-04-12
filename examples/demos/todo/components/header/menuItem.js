import React from 'react';
import './style/menuitem.css';

export default function MenuItem(props) {
  const { item, switchMenu } = props;
  function active(e) {
    const id = +e.target.getAttribute('data-id');
    switchMenu && switchMenu(id);
  }
  return (
    <div className = {`menu-item ${item.active ? 'active' : '' }`}>
      <div 
        className = 'item-content'
        onClick = { active }
        data-id = {item.id}
      >
        {item.title}
      </div>
    </div>
  )
}