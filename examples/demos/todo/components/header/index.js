import React, { Component } from 'react';
import { connect, useModel } from '@maoyan/tangdao'
import MenuItem from './menuItem';

const config = [
  {
    title: '时光记录',
    id: 0
  },
  {
    title: '备忘录',
    id: 1
  },
  {
    title: '回收站',
    id: 2
  }
]

class Index extends Component {
  constructor(props) {
    super(props);
    this.activeMenuDispatch = useModel('activeMenu').autoDispatch;
  }

  initMenu() {
    const activeMenu = this.props.activeMenu;
    config.forEach(item => {
      item.active = item.id === activeMenu.id;
    })
  }

  switchMenu = id => {
    let activeItem = {};
    config.forEach(item => {
      item.id === id && (activeItem = item);
    })
    this.activeMenuDispatch.switchMenu(activeItem);
  }

  render(){
    this.initMenu();
    return (
      <div>
        {
          config.map(item => {
            return (
              <MenuItem
                  item={item}
                  key={item.id}
                  switchMenu={this.switchMenu}
              />
            )
          })
        }
      </div>
    )
  }
}

export default connect(state => ({
    activeMenu: state.activeMenu
  })
)(Index)