import React, { Component } from 'react';
import { List, Spin } from 'antd';
import { connect, useModel } from '@maoyan/tangdao';

import './style/index.css';

class DiaryList extends Component {

  constructor(props) {
    super(props);
    const diaryModel = useModel('diary');
    this.diaryDispatch = diaryModel.autoDispatch;
    this.diaryActionType = diaryModel.actionType;
  }

  componentDidMount() {
    this.diaryDispatch.fetchList();
  }

  deleteDiaryItem = item => {
    return () => {
      this.diaryDispatch.deleteDiaryItem(item);
    }
  }

  unfold = item => {
    return () => {
      this.diaryDispatch.unfold(item);
    }
  }

  render() {
    const { diary, loading } = this.props;
    return (
      <div className="panel">
        <List
            dataSource={diary.list}
            loading={loading.effects[this.diaryActionType.fetchList]}
            renderItem={
              item => (
                <List.Item
                    actions={[
                      <a
                          data-item={item}
                          key="list-loadmore-edit"
                          onClick={this.unfold(item)}
                      >
                        展开
                      </a>,
                      <a
                          data-item={item}
                          key="list-loadmore-more"
                          onClick={this.deleteDiaryItem(item)}
                      >
                        删除
                      </a>
                    ]}
                >
                  <List.Item.Meta
                      description={item.unfold || item.content.length < 25  ? item.content : item.content.substr(0, 25) + '...'}
                      title={item.date}
                  />
                </List.Item>
              )
            }
          >
        </List>
        {
          loading.effects[this.diaryActionType.deleteDiaryItem] ? (<div className="loading-wrap">
            <Spin
                className="loading"
                tip="删除中..."
            />
          </div>) : null
        }
      </div>
    )
  }
}

export default connect(state => {
  return {
    diary: state.diary,
    loading: state.loading
  }
})(DiaryList)