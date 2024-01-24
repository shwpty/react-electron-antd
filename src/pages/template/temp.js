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
      nodeSlotProgress: {},
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
      console.log(response);
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

    ipcRenderer.on('pushedData', (event, data) => {
      console.log('Received pushed data:', data);
      this.setState({ slotInfo: data });
    })
    ipcRenderer.on('Counting Number', (event, data) => {
      this.setState({ slotNumber: data });
      console.log('SlotNumber: ', data)
    })
    ipcRenderer.on('push-end', (event, data) => {
      console.log('Push ending', data);
    })

    ipcRenderer.on('getdata',(event, data) => {
      console.log(data);
    })
    ipcRenderer.on('getend', (event, data) => {
      console.log('Get ending', data);
    })
    ipcRenderer.on('postdata', (event, data) => {
      console.log('PushData: ', data);
    })


    ipcRenderer.on('process-response', (event, response) => {
      console.log('Received response:', response);
    })

    // 假设slotNumber是当前处理的总槽位数
    const slotNumber = this.state.slotNumber;
    console.log(slotNumber)
    const nodeSlotProgress = { ...this.state.nodeSlotProgress };

    // 假设responseData和migPlanContent已经定义并包含所需数据
    const responseDataSlots = this.state.responseData.slotlist;
    const migPlanContentSlots = this.state.migPlanContent.SlotList;

    // 计算每个节点的进度
    migPlanContentSlots.forEach(slotItem => {
      const correspondingSlot = responseDataSlots.find(item => item.NodeId === slotItem.NodeId);
      if (correspondingSlot) {
        // 如果在responseData中找到对应的NodeId
        const progress = Math.min(slotNumber, correspondingSlot.Slot.length);
        nodeSlotProgress[slotItem.NodeId] = progress;
      } else {
        // 如果在responseData中没有找到对应的NodeId
        nodeSlotProgress[slotItem.NodeId] = slotNumber;
      }
    
    });

    // 更新状态
    this.setState({ nodeSlotProgress });
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

    const responseData = this.state.responseData;
    const migPlanContent = this.state.migPlanContent;

    // 比较slotlist数组的长度，并设置栅格个数
    const gridCount = Math.max(
      responseData.slotlist.length,
      migPlanContent.SlotList.length
    );
    this.setState({ gridCount });
    console.log(gridCount);

    // 计算slot的个数
    const calculateSlots = (slotList) => {
      return slotList.reduce((acc, { NodeId, Slot }) => {
        const slotCount = Slot.reduce((count, value, index) => {
          // 只处理奇数索引，并从前一个偶数索引值中减去
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
    const responseDataSlots = calculateSlots(responseData.slotlist);
    const migPlanContentSlots = calculateSlots(migPlanContent.SlotList);

    console.log(responseDataSlots);
    console.log(migPlanContentSlots);

    // 比较并设置方格数
    const squareCounts = Object.keys(responseData.slotlist.length > migPlanContent.SlotList.length ? responseDataSlots : migPlanContentSlots).reduce((acc, nodeId) => {
      acc[nodeId] = Math.max(
        responseDataSlots[nodeId] || 0,
        migPlanContentSlots[nodeId] || 0 // 如果migPlanContent中没有对应的NodeId，使用0
      );
      return acc;
    }, {});

    this.setState({ squareCounts });
    console.log(squareCounts)
  };

  renderSlots = (nodeId, count, currentSlotNumber) => {
    const squares = [];
    for (let i = 0; i < count; i++) {
      // 根据slotNumber和节点当前的槽位数来决定颜色
      const color = i < currentSlotNumber ? '#98FB98' : '#D3D3D3'; // 绿色或灰色
      squares.push(
        <div key={i} style={{
          width: '2px',
          height: '2px',
          backgroundColor: color,
          margin: '1px',
        }}></div>
      );
    }
    return (
      <div key={nodeId} style={{ display: 'flex', flexWrap: 'wrap' }}>
        {squares}
      </div>
    );
  }
  
  
  renderAllSlots = (squareCounts) => {
    const { nodeSlotProgress } = this.state;
    const nodesRender = Object.keys(squareCounts).map(nodeId => {
      // 获取当前节点的进度
      const currentSlotNumber = nodeSlotProgress[nodeId] || 0;
      return (
        <div key={nodeId} style={{ margin: '10px' }}>
          {this.renderSlots(nodeId, squareCounts[nodeId], this.state.slotNumber)}
          <h4 style={{ textAlign: 'center' }}>Node {nodeId}</h4>
        </div>
      );
    });

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
        console.log(`Newer NodeId ${slotItem.NodeId} find`);
        console.log(slotItem);
        slotItem.Slot.forEach((slot, index) => {
          if (index % 2 !== 0) {
            AllSlotNumber += ( slotItem.Slot[index] - slotItem.Slot[index - 1] + 1 );
          }
          console.log(`Slot: ${slot}`);
          console.log(AllSlotNumber);
        });
      }
    });

    this.setState({ allSlot: AllSlotNumber });
  };

  componentDidMount() {
      // 执行getall之前执行一次clear(嵌套方式)
      ipcRenderer.send('clear-request')
      ipcRenderer.on('clear-response', (event, response) => {
        // console.log(response)
        ipcRenderer.send('getall-request')
      })
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
      // ipcRenderer.send('getall-request')
      // getall
      ipcRenderer.on('getall-response', (event, response) => {
          // console.log(response)  // 响应原型
          const tempresponse = JSON.parse(response);  // JSON字符串解析
          // console.log(tempresponse)
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
    const { collapsed, selectedRowKeys, responseData, migPlanContent, slotNumber} = this.state;
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
              <Modal title='Expanding' width={800} open={this.state.isExpandingOpen} onOk={this.handleCancel} onCancel={this.handleCancel}>
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                  {this.renderAllSlots(this.state.squareCounts)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <Button type='primary' onClick={this.handleProgress} loading={this.state.showProgress}>Execute</Button>
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
              <Modal title='Removing' width={800} open={this.state.isRemovingOpen} onOk={this.handleCancel} onCancel={this.handleCancel}>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1, padding: '10px', marginRight: '10px' }}>
                    <h4>SlotList</h4>
                    <pre style={{ backgroundColor: '#DCDCDC' }}>{JSON.stringify(responseData.slotlist, null, 2)}</pre>
                  </div>
                  <div style={{ flex: 1, padding: '10px', marginLeft: '10px' }}>
                    <h4>MigrationPlan</h4>
                    <pre style={{ backgroundColor: '#DCDCDC' }}>{JSON.stringify(migPlanContent.SlotList, null, 2)}</pre>
                  </div>
                </div> 
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <Button type='primary' onClick={this.handleProgress} loading={this.state.showProgress}>Execute</Button>
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