import React, { Component } from 'react';
import { Spin, message } from 'antd';
import { connect, useModel } from '@maoyan/tangdao';
import "./style/home.css";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      diray: ""
    }
    const todayDiary = useModel('todayDiary');
    this.todayDiaryDispatch = todayDiary.autoDispatch;
    this.todayDiaryActionType = todayDiary.actionType;
  }

  saveDiray = () => {
    const state = this.state;
    if (!state.diray) {
      message.error('日记不能为空');
      return;
    }
    const date = new Date();
    const diray = {
      id: Math.floor(date.getTime() / 1000),
      content: state.diray,
      date: new Date().toLocaleString()
    };
    this.todayDiaryDispatch.saveDiary(diray).then(() => {
      this.setState({
        diray: ""
      })
      message.info('保存成功');
    });
  }

  handleDirayChange = e => {
    this.setState({
      diray: e.target.value
    })
  }

  render() {
    const state = this.state;
    const { loading } = this.props;
    return (
      <div className="panle">
        <textarea
            className="diray"
            onChange={this.handleDirayChange}
            placeholder="记录美好时光从现在开始..."
            value={state.diray}
        ></textarea>
        <div className="save-btn">
          <span onClick={this.saveDiray}>保存</span>
        </div>
        {
          loading.effects[this.todayDiaryActionType.saveDiary] ? (
            <div className="loading-wrap">
              <Spin
                  className="loading"
                  tip="保存中..."
              />
            </div>
          ) : null
        }
      </div>
    )
  }
}

export default connect(state => {
  return {
    loading: state.loading
  }
})(Home)