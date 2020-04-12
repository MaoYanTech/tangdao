import React, { Component } from 'react';
import { List, Spin } from 'antd';
import { connect, useModel } from '@maoyan/tangdao';

class Trash extends Component {
  constructor(props) {
    super(props);
    const trashModel = useModel('trash');
    this.trashDispatch = trashModel.autoDispatch;
    this.trashActionType = trashModel.actionType;
  }

  componentDidMount() {
    this.trashDispatch.fetchList();
  }

  restore = item => {
    return () => {
      this.trashDispatch.restore(item);
    }
  }

  render() {
    const { trash, loading } = this.props;
    return (
      <div className="panel">
        <List
            dataSource={trash.list}
            loading={loading.effects[this.trashActionType.fetchList]}
            renderItem={
              item => (
                <List.Item
                    actions={[
                      <a
                          data-item={item}
                          key="list-loadmore-more"
                          onClick={this.restore(item)}
                      >
                        还原
                      </a>
                    ]}
                >
                <List.Item.Meta
                    description={item.content}
                    title={item.date}
                />
              </List.Item>
            )
          }
        >
        </List>
        {
          loading.effects["trash/restore"] ? (<div className="loading-wrap">
            <Spin tip="还原中..." />
          </div>) : null
        }
      </div>
    )
  }
}

export default connect( state => {
  return {
    trash: state.trash,
    loading: state.loading
  }
})(Trash);