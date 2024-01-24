import React, { Component } from 'react';
import {
  DesktopOutlined,
  PieChartOutlined,
  LaptopOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Flex, Table, Modal, Popover, Progress } from 'antd';
const { Content, Footer, Sider } = Layout;
const { ipcRenderer } = window.require('electron')

const items = [
  getItem('节点信息', '1', <DesktopOutlined />),
  getItem('Test', '2', <PieChartOutlined />),
];

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const data = [
  {
    // 故障节点状态
    id: '0',
    status:<Avatar style={{backgroundColor: '#FF0000' }} icon={<LaptopOutlined/>}/>
  },
  {
    // 待扩容节点状态
    id: '1',
    status:<Avatar icon={<LaptopOutlined/>}/>,
  },
  {
    // 正常运行-主
    id: '2',
    status:<Avatar style={{ backgroundColor: '#87d068' }} icon={<LaptopOutlined/>}/>,
  },
  {
    // 正常运行-备
    id: '3',
    status:<Avatar style={{ backgroundColor: '#98FB98' }} icon={<LaptopOutlined/>}/>,
  },
];


class ShowNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      isExpandModalOpen: false,
      isExpandingOpen: false,
      isRemoveModalOpen: false,
      isRemovingOpen: false,
      showProgress: false,
      selectedRowKeys: [],
      responseData: {},
      // cluster: [],
      // slotlist: [],
      // pendingnode: '',
      // runningnode: '',
      migPlanContent: {},
      slotInfo: null,
      slotNumber: 0,
      allSlot: 0,
      squareCounts: {},
      renderedSlots: {},
    };
  }

  clearAllChoice = () => {
    this.setState({ selectedRowKeys: [] });
  };

  toggleCollapsed = () => {
    this.setState((prevState) => ({
      collapsed: !prevState.collapsed,
    }));
  };

  onSelectChange = (newSelectedRowKeys) => {
    this.setState({ selectedRowKeys: newSelectedRowKeys });
  };

  confirmExpand = () => {
    this.setState({ isExpandModalOpen: true });
  };

  confirmRemove = () => {
    this.setState({ isRemoveModalOpen: true });
  };

  hasPendingNode = () => {
    const selectedNode = this.state.responseData.cluster.filter(item => this.state.selectedRowKeys.includes(item.nodeid)).map(row => row.state);
    const hasPendingNode = selectedNode.some(item => item === 1);
    return hasPendingNode
  };

  hasRunningNode = () => {
    const selectedNode = this.state.responseData.cluster.filter(item => this.state.selectedRowKeys.includes(item.nodeid)).map(row => row.state);
    const hasRunningNode = selectedNode.some(item => item === 2 || item === 3);
    return hasRunningNode
  };

  handleCancel = () => {
    this.setState({ 
      isExpandModalOpen: false, 
      isRemoveModalOpen: false, 
      isExpandingOpen: false,
      isRemovingOpen: false,
    });
  };

  handleExpand = () => {
    this.setState({ isExpandModalOpen: false, isExpandingOpen: true });
    ipcRenderer.send('expand-request', this.state.selectedRowKeys);
    ipcRenderer.on('expand-response', (event, response) => {
      // console.log(response);
      this.setState({ migPlanContent: JSON.parse(response) }, () =>{
        this.compSlotlist();
      });
    });
  };

  handleRemove = () => {
    this.setState({ isRemoveModalOpen: false, isRemovingOpen: true });
    ipcRenderer.send('remove-request', this.state.selectedRowKeys);
    ipcRenderer.on('remove-response', (event, response) => {
      this.setState({ migPlanContent: JSON.parse(response) }, () =>{
        this.compSlotlist();
      });
    });
  };

  handleProgress = () => {
    this.setState({ showProgress: true });
    this.getAllSlot();
    
    // ipcRenderer.send('get');
    ipcRenderer.send('process-request');

    // push stream includes data and number
    ipcRenderer.on('stream_push', (event, data) => {
      console.log('stream_push:', data);
    })
    ipcRenderer.on('pushedData', (event, data) => {
      console.log('Received pushed data:', data);
      this.setState({ slotInfo: data });
    })
    ipcRenderer.on('Counting Number', (event, data) => {
      this.setState({ slotNumber: data });
    })

    // post method with data and end
    ipcRenderer.on('post_push', (event, data) => {
      console.log('post_push:', data);
    })
    ipcRenderer.on('postdata', (event, data) => {
      console.log('PoshData: ', data);
    })
    ipcRenderer.on('process-response', (event, response) => {
      console.log('Received response:', response);
    })
  };

  renderAvatar(item) {
    if (String(item.state) === data[0].id) {
      return data[0].status
    }
    else if (String(item.state) === data[1].id) {
      return data[1].status
    }
    else if (String(item.state) === data[2].id) {
      return data[2].status
    }
    else if (String(item.state) === data[3].id) {
      return data[3].status
    }
  };

  renderText(item) {
    if (String(item.state) === data[0].id) {
      return 'ERROR'
    }
    else if (String(item.state) === data[1].id) {
      return 'ONLINE'
    }
    else if (String(item.state) === data[2].id) {
      return 'ACTIVE'
    }
    else if (String(item.state) === data[3].id) {
      return 'STANDBY'
    } 
  };

  compSlotlist = () => {
    // 计算slot的个数
    const calculateSlots = (slotList) => {
      return slotList.reduce((acc, { NodeId, Slot }) => {
        const slotCount = Slot.reduce((count, value, index) => {
          if (index % 2 !== 0) {
            return count + (value - Slot[index - 1] + 1);
          }
          return count;
        }, 0);

        acc[NodeId] = Math.max(acc[NodeId] || 0, slotCount); // 比较并存储较大的slot个数
        return acc;
      }, {});
    };
    // 计算responseData和migPlanContent中的slot个数
    const responseDataSlots = calculateSlots(this.state.responseData.slotlist);
    const migPlanContentSlots = calculateSlots(this.state.migPlanContent.SlotList);

    // 比较并设置方格数
    const squareCounts = Object.keys(this.state.responseData.slotlist.length > this.state.migPlanContent.SlotList.length ? responseDataSlots : migPlanContentSlots).reduce((acc, nodeId) => {
      acc[nodeId] = Math.max(
        responseDataSlots[nodeId] || 0,
        migPlanContentSlots[nodeId] || 0 // 如果migPlanContent中没有对应的NodeId，使用0
      );
      return acc;
    }, {});

    console.log(squareCounts)
    this.setState({
      squareCounts,
      responseDataSlots,
      migPlanContentSlots,
    });
  };

  renderExpandSlots = (squareCounts) => {
    const { responseDataSlots, migPlanContentSlots, slotNumber } = this.state;
    let nodesRender = [];
    const nodeIds = Object.keys(squareCounts);
    let id = [];
    id[0] = 0;
    // 计算对于每个node要渲染的前区间
    for (let w = 1; w < nodeIds.length - 1; w++) {
      id[w] = id[w-1]+responseDataSlots[nodeIds[w-1]] - migPlanContentSlots[nodeIds[w-1]];
    }
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const count = squareCounts[nodeId];
      let squares = [];
      let backgroundColor = '#D3D3D3'; // Default grey color
      const isNodeInBoth = responseDataSlots.hasOwnProperty(nodeId) && migPlanContentSlots.hasOwnProperty(nodeId);
      if (isNodeInBoth) {
        backgroundColor = '#98FB98';
      }
      for (let j = 0; j < count; j++) {
        if (isNodeInBoth) {
          // greySquaresCount表示每个node要渲染的后区间
          const greySquaresCount = responseDataSlots[nodeId] - migPlanContentSlots[nodeId];
          backgroundColor = j < (slotNumber-id[i]) && j < greySquaresCount ? '#FFFF00' : '#98FB98';
        }
        else {
          backgroundColor = j < slotNumber ? '#98FB98' : '#D3D3D3';
        }
        squares.push(
          <div key={`${nodeId}-${j}`} style={{
            width: '4px',
            height: '4px',
            backgroundColor,
            margin: '1px',
            display: 'inline-block',
          }}></div>
        );
      }
  
      nodesRender.push(
        <div key={nodeId} style={{ margin: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {squares}
          </div>
          <h4 style={{ textAlign: 'center' }}>Node {nodeId}</h4>
        </div>
      );
    }

    return nodesRender;
  }

  renderRemoveSlots = (squareCounts) => {
    const { responseDataSlots, migPlanContentSlots, slotNumber } = this.state;
    console.log(responseDataSlots, migPlanContentSlots)
    let nodesRender = [];
    const nodeIds = Object.keys(squareCounts);
    let id = [];
    id[0] = 0;
    // 计算对于每个node要渲染的前区间
    for (let w = 1; w < nodeIds.length - 1; w++) {
      id[w] = id[w-1]+migPlanContentSlots[nodeIds[w-1]] - responseDataSlots[nodeIds[w-1]];
    }
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const count = squareCounts[nodeId];
      let squares = [];
      let backgroundColor = '#98FB98'; // Default grey color
      const isNodeInBoth = responseDataSlots.hasOwnProperty(nodeId) && migPlanContentSlots.hasOwnProperty(nodeId);
      for (let j = count; j > 0; j--) {
        if (isNodeInBoth) {
          // greySquaresCount表示每个node要渲染的后区间
          const greenSquaresCount = migPlanContentSlots[nodeId];
          backgroundColor = (count-j) < greenSquaresCount && (count-j) < (slotNumber+responseDataSlots[nodeId]-id[i])  ? '#98FB98' : '#D3D3D3';
        }
        else {
          backgroundColor = j <= slotNumber ? '#FFFF00' : '#98FB98';
        }
        squares.push(
          <div key={`${nodeId}-${j}`} style={{
            width: '4px',
            height: '4px',
            backgroundColor,
            margin: '1px',
            display: 'inline-block',
          }}></div>
        );
      }
  
      nodesRender.push(
        <div key={nodeId} style={{ margin: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {squares}
          </div>
          <h4 style={{ textAlign: 'center' }}>Node {nodeId}</h4>
        </div>
      );
    }

    return nodesRender;
  }
  
  
  getAllSlot = () => {
    let AllSlotNumber = 0;
    let largerSlotList = [], smallerSlotList = [];

    if (this.state.migPlanContent.SlotList.length > this.state.responseData.slotlist.length) {
      largerSlotList = this.state.migPlanContent.SlotList;
      smallerSlotList = this.state.responseData.slotlist;
    }
    else {
      largerSlotList = this.state.responseData.slotlist;
      smallerSlotList = this.state.migPlanContent.SlotList;
    }
    largerSlotList.forEach(slotItem => {
      const correspondingSlot = smallerSlotList.find(item => item.NodeId === slotItem.NodeId);
      if (!correspondingSlot) {
        // 如果在新的SlotList中发现了原有slotlist中没有的nodeid，则遍历
        // console.log(`Newer NodeId ${slotItem.NodeId} find`);
        // console.log(slotItem);
        slotItem.Slot.forEach((slot, index) => {
          if (index % 2 !== 0) {
            AllSlotNumber += ( slotItem.Slot[index] - slotItem.Slot[index - 1] + 1 );
          }
          console.log(`Slot: ${slot}`);
          console.log(AllSlotNumber);
        });
      }
    });
    console.log(AllSlotNumber);
    this.setState({ allSlot: AllSlotNumber });
  };

  componentDidMount() {
      // 执行getall之前执行一次clear(嵌套方式)
      ipcRenderer.send('clear-request')
      // ipcRenderer.on('clear-response', (event, response) => {
      //   // console.log(response)
      //   ipcRenderer.send('getall-request')
      // })
      // 测试server push功能 
      // ipcRenderer.send('serverpush')
      // ipcRenderer.on('pushedData', (event, data) => {
      //   console.log('Received pushed data:', data);
      //   this.setState({ slotInfo: data });
      // })
      // ipcRenderer.on('Counting Number', (event, data) => {
      //   this.setState({ slotNumber: data });
      // })
      // ipcRenderer.on('push-end', (event, data) => {
      //   console.log('Push ending', data);
      // })
      
      // 单独执行getall(测试用)
      setTimeout(() => {
        ipcRenderer.send('getall-request');
      }, 2000);

      
      // get method with data and end
      ipcRenderer.on('getdata',(event, data) => {
        console.log(data);
      })
      ipcRenderer.on('getend', (event, data) => {
        console.log('Get ending', data);
      })
      // getall
      ipcRenderer.on('getall-response', (event, response) => {
          console.log(response)  // 响应原型
          let tempresponse;
          try {
            tempresponse = JSON.parse(response);  // JSON字符串解析
            console.log(tempresponse);
          } catch (error) {
            tempresponse = {};
            console.error(error);
          }
          this.setState({
            responseData: tempresponse,
            // cluster: tempresponse.cluster,
            // pendingnode: tempresponse.pendingnode,
            // runningnode: tempresponse.runningnode,
            // slotlist: tempresponse.slotlist,
          })
      })
  };


  render() {
    const { collapsed, selectedRowKeys, responseData, slotNumber} = this.state;
    const hasSelected = selectedRowKeys.length > 0;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: '',
        dataIndex: 'status',
        key: 'status', 
        align: 'center',
        render: (text, record) => (
          <Popover title={'Node Id: ' + record.nodeid} content={<pre>{JSON.stringify(responseData.slotlist, null, 2)}</pre>} placement='right'>
            {this.renderAvatar(record)}
          </Popover>
        )
      },
      {
        title: 'Node ID',
        dataIndex: 'nodeid',
        key: 'nodeid',
        defaultSortOrder: 'ascend',
      },
      {
        title: 'IP Port',
        dataIndex: 'ip:port',
        key: 'ip:port',
      },
      {
        title: 'Master',
        dataIndex: 'master',
        key: 'master',
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        render: (text, record) => this.renderText(record),
      },
      {
        title: 'Replica',
        dataIndex: 'replica',
        key: 'replica',
        render: (text, record) => (
          <span>{record.replica.map((item, index) => (
            <span key={index}>{item}{index !== record.replica.length - 1 ? ', ' : ''}</span>
          ))}</span>
        ),
      },
    ];

    return (
      <Layout style={{ minWidth: '800px', minHeight: '100vh' }}>
          <Layout style={{
            paddingTop: '8px',
            minHeight: 'calc(100vh - 64px)',
            }} hasSider>
            <Sider 
            theme='light'
            collapsible 
            collapsed={collapsed} 
            onCollapse={this.toggleCollapsed}
            >
            <Menu theme="light" defaultSelectedKeys={['1']} mode="inline" items={items}/>
            </Sider>
            <Layout>       
            <Content style={{margin: '0 16px', background: '#ffffff',}}>
              <div style={{padding: 24, minHeight: 360,}}>
                <div style={{ marginBottom: 8,}}>
                  <Flex gap='middle' wrap='wrap'>
                      <Button type='primary' onClick={this.confirmExpand} disabled={!hasSelected || this.hasRunningNode()}>扩容</Button>
                      <Button type='primary' onClick={this.confirmRemove} disabled={!hasSelected || this.hasPendingNode()}>缩容</Button>
                      <Button type='primary' onClick={this.clearAllChoice} disabled={!hasSelected}>清空选择</Button>
                  </Flex>
                </div>
                <Table dataSource={responseData.cluster} columns={columns} pagination={false} 
                        rowSelection={rowSelection} rowKey='nodeid' />           
              </div>
              <Modal title='Confirm' open={this.state.isExpandModalOpen} onOk={this.handleExpand} onCancel={this.handleCancel}>
                <p>Are you sure to expand ? </p>
              </Modal>
              <Modal title='Expanding' width={1200} open={this.state.isExpandingOpen} onOk={()=>{window.location.reload();}} onCancel={this.handleCancel}>
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                  {this.state.isExpandingOpen && this.renderExpandSlots(this.state.squareCounts)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <Button type='primary' onClick={this.handleProgress} loading={slotNumber !== this.state.allSlot}>Execute</Button>
                </div>
                { 
                  this.state.showProgress &&
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <span style={{ float: 'left' }}>{this.state.slotInfo}</span>
                    <Progress percent={ (slotNumber / this.state.allSlot * 100).toFixed(2)} status={slotNumber === this.state.allSlot ? "success" : "active"} />
                  </div>
                }
              </Modal>
              <Modal title='Confirm' open={this.state.isRemoveModalOpen} onOk={this.handleRemove} onCancel={this.handleCancel}>
                <p>Are you sure to remove ? </p>
              </Modal>
              <Modal title='Removing' width={1200} open={this.state.isRemovingOpen} onOk={()=>{window.location.reload();}} onCancel={this.handleCancel}>
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                  {this.state.isRemovingOpen && this.renderRemoveSlots(this.state.squareCounts)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <Button type='primary' onClick={this.handleProgress} loading={slotNumber !== this.state.allSlot}>Execute</Button>
                </div>
                { this.state.showProgress &&
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <span style={{ float: 'left' }}>{this.state.slotInfo}</span>
                    <Progress percent={ (slotNumber / this.state.allSlot * 100).toFixed(2)} status={slotNumber === this.state.allSlot ? "success" : "active"} />
                  </div>
                }
              </Modal>
            </Content>
            <Footer style={{textAlign: 'center',}}>
              NodeManagement ©2023 Created by Bumblebee
            </Footer>
            </Layout>
          </Layout>
      </Layout>
    );
  }
}

export default ShowNode;