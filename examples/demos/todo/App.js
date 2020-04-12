import React, { Component } from 'react';
import { connect } from '@maoyan/tangdao';
import Header from './components/header';
import Home from './components/home';
import List from './components/list';
import Trash from './components/trash';
import './static/style/app.css';

class App extends Component {

  getCurrentPanale() {
    const { activeMenu } = this.props;
    let currentPanle;
    switch(activeMenu.id) {
      case 0:
        currentPanle = Home;
        break;
      case 1:
        currentPanle = List;
        break;
      case 2:
        currentPanle = Trash;
        break;
      default:
          break;
    }
    return currentPanle;
  }

  render() {
    const CurrentPanle = this.getCurrentPanale();
    return (
      <div className="container">
        <Header />
        <CurrentPanle />
      </div>
    )
  }
}

export default connect(state => {
  return {
    activeMenu: state.activeMenu
  }
})(App);