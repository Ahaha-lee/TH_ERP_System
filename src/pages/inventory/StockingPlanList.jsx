import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Form, Input, Select, Button, Space, Tag, Modal, message, Tooltip, Drawer, Row, Col, Typography, Checkbox, Statistic, Divider, Descriptions
} from 'antd';
const { Text } = Typography;
import { 
  SearchOutlined, 
  CheckCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMockData, mockData } from '../../mock/data';

const StockingPlanList = () => {
  const [form] = Form.useForm();
  const [confirmForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useMockData('stockingPlans');
  const [warehouses] = useMockData('warehouses');
  const [batches] = useMockData('batches');
  const [deliveryNotices] = useMockData('deliveryNotices');
  const [normalOrders] = useMockData('normalOrders');
  const [loading, setLoading] = useState(false);

  const getPlanInfo = (record) => {
    if (!record) return { salesOrderNo: '-', customerName: '-' };
    let salesOrderNo = record.salesOrderNo || '';
    let customerName = record.customerName || '';

    // If already stored in mock data
    if (salesOrderNo && customerName) {
      return { salesOrderNo, customerName };
    }

    if (record.outboundType === '领料出库') {
      return { salesOrderNo: '-', customerName: '内部分装 (领料部)' };
    }

    // Attempt to lookup via deliveryNotice list
    if (record.relOrderNo) {
      const notice = (deliveryNotices || []).find(
        dn => dn.noticeNo === record.relOrderNo || dn.id === record.relOrderNo || dn.orderNo === record.relOrderNo
      );
      if (notice) {
        salesOrderNo = notice.orderNo || notice.sourceOrderNo || '';
        customerName = notice.customerName || '';
      } else {
        // Attempt to lookup via normalOrders list
        const order = (normalOrders || []).find(
          o => o.orderNo === record.relOrderNo || o.id === record.relOrderNo
        );
        if (order) {
          salesOrderNo = order.orderNo;
          customerName = order.customerName;
        }
      }
    }

    // Default fallbacks for initial mocks if lookup didn't yield values
    if (!salesOrderNo || !customerName) {
      if (record.id === 'sp1') {
        salesOrderNo = 'SO20250428001';
        customerName = '美家家居';
      } else if (record.id === 'sp3') {
        salesOrderNo = 'SO20250426002';
        customerName = '宜居美学';
      } else {
        salesOrderNo = record.salesOrderNo || record.relOrderNo || '-';
        customerName = record.customerName || '华南建材合伙人';
      }
    }

    return { salesOrderNo, customerName };
  };
  const [detailVisible, setDetailVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    if (location.state && location.state.searchNo) {
      form.setFieldsValue({ planNo: location.state.searchNo });
      handleSearch({ planNo: location.state.searchNo });
    }
  }, [location.state]);

  const handleSearch = (values) => {
    setSearchText(JSON.stringify(values));
  };

  const handleReset = () => {
    form.resetFields();
    setSearchText('');
  };

  const searchParams = searchText ? JSON.parse(searchText) : {};

  const filteredData = data.filter(item => {
    if (searchParams.planNo && !item.planNo.includes(searchParams.planNo)) return false;
    if (searchParams.relOrderNo && !item.relOrderNo.includes(searchParams.relOrderNo)) return false;
    if (searchParams.outboundOrderNo && !item.outboundOrderNo.includes(searchParams.outboundOrderNo)) return false;
    if (searchParams.outboundType && item.outboundType !== searchParams.outboundType) return false;
    if (searchParams.status && item.status !== searchParams.status) return false;
    if (searchParams.productName && !item.productInfo.includes(searchParams.productName)) return false;
    return true;
  });

  const handleConfirmOutbound = (record) => {
    setCurrentRecord(record);
    const productNames = record.productInfo ? record.productInfo.split(', ') : [];
    const initialItems = record.items || productNames.map((name, index) => ({
      productCode: `PROD00${index + 1}`,
      productName: name,
      spec: index % 2 === 0 ? '1220*2440*18mm' : '1220*2440*15mm',
      model: index % 2 === 0 ? 'E0级' : 'E1级',
      quantity: 1,
      warehouse: '主成品仓库',
      isOutbound: record.status === '确认出库',
    }));
    confirmForm.setFieldsValue({ items: initialItems });
    
    // Auto-select remaining items that can be checked (not already outbounded)
    const selectableIndices = [];
    initialItems.forEach((item, index) => {
      if (!item.isOutbound) {
        selectableIndices.push(index);
      }
    });
    setSelectedRowKeys(selectableIndices);
    
    setConfirmModalVisible(true);
  };

  const onConfirmFinish = (values) => {
    const formItems = values.items || [];
    const selectedItemsToOutbound = formItems.filter((item, index) => {
      return selectedRowKeys.includes(index) && !item.isOutbound;
    });

    if (selectedItemsToOutbound.length === 0) {
      message.warning('请勾选并选择需要出库的产品');
      return;
    }

    // Update items array, setting isOutbound: true for chosen items
    const updatedItems = formItems.map((item, index) => {
      if (selectedRowKeys.includes(index)) {
        return { ...item, isOutbound: true };
      }
      return { 
        ...item, 
        isOutbound: item.isOutbound ?? false 
      };
    });

    // Check if everything is outbounded
    const allOutbound = updatedItems.every(item => item.isOutbound);
    
    const finalStatus = allOutbound ? '确认出库' : '部分出库';
    const newOutboundOrderNo = `OUT${dayjs().format('YYYYMMDDHHmmss')}`;

    // Create and save simulated outbound order
    const mockOutbound = {
      id: `out_${Date.now()}`,
      orderNo: newOutboundOrderNo,
      type: currentRecord.outboundType || '销售出库',
      outboundType: currentRecord.outboundType || '销售出库',
      outboundDate: dayjs().format('YYYY-MM-DD'),
      operator: '管理员',
      status: '已出库',
      customerName: '关联客户',
      relOrderNo: currentRecord.relOrderNo,
      items: selectedItemsToOutbound.map(item => ({
        productCode: item.productCode,
        productName: item.productName,
        spec: item.spec,
        quantity: item.quantity,
        outboundQty: item.quantity,
        warehouseName: item.warehouse || '主成品仓库',
        batchNo: item.batchNo || 'B20250501001',
        location: item.location || 'A-01-01',
        price: '2000'
      })),
      totalQty: selectedItemsToOutbound.reduce((acc, item) => acc + (item.quantity || 0), 0),
    };

    mockData.upsert('outboundOrders', mockOutbound);

    const updatedRecord = { 
      ...currentRecord, 
      status: finalStatus,
      outboundOrderNo: newOutboundOrderNo,
      operationTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      items: updatedItems
    };
    
    mockData.upsert('stockingPlans', updatedRecord);
    message.success(`成功生成出库单（${newOutboundOrderNo}），出库确认完成！`);
    setConfirmModalVisible(false);
  };





  const handleClosePlan = (record) => {
    Modal.confirm({
      title: '确认手动关闭该备货计划吗？',
      content: '手动关闭后，系统自动更新未出库产品相关信息！',
      okText: '确认关闭',
      cancelText: '取消',
      onOk: () => {
        const updatedRecord = {
          ...record,
          status: '已关闭',
          operationTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        
        // Locate and update associated Delivery Notice (发货通知单)
        const currentNotices = [...(deliveryNotices || [])];
        const matchedNoticeIndex = currentNotices.findIndex(
          dn => dn.noticeNo === record.relOrderNo || dn.id === record.relOrderNo
        );

        // Gather list of items in the stocking plan that are not yet outbounded
        const productNames = record.productInfo ? record.productInfo.split(', ') : [];
        const planItems = record.items || productNames.map((name, index) => ({
          productCode: `PROD00${index + 1}`,
          productName: name,
          spec: index % 2 === 0 ? '1220*2440*18mm' : '1220*2440*15mm',
          model: index % 2 === 0 ? 'E0级' : 'E1级',
          quantity: index === 0 ? 5 : 12,
          warehouse: '主成品仓库',
          isOutbound: record.status === '确认出库' || (record.status === '部分出库' && index === 0),
        }));

        const unshippedItems = planItems.filter(item => !item.isOutbound);

        if (matchedNoticeIndex > -1) {
          const targetNotice = { ...currentNotices[matchedNoticeIndex] };
          targetNotice.status = '已完成(备货取消)';
          targetNotice.remark = '备货计划关闭';
          
          if (targetNotice.items) {
            targetNotice.items = targetNotice.items.map(item => {
              // Try to find if this item was in our stocking plan and unshipped
              const matchInPlan = unshippedItems.find(
                p => p.productName === item.productName || p.productCode === item.productCode
              );
              if (matchInPlan) {
                const planQty = matchInPlan.quantity || 0;
                // Reduce already shipped quantity, increase pending (unshipped) quantity
                const newShipped = Math.max(0, (item.shippedQty || 0) - planQty);
                const newPending = (item.pendingQty || 0) + planQty;
                return {
                  ...item,
                  shippedQty: newShipped,
                  pendingQty: newPending,
                  shippedQtyChange: planQty,
                  pendingQtyChange: planQty,
                  currentQty: 0, // cancelled shipping quantity
                  remark: '备货计划关闭'
                };
              }
              return item;
            });
          }
          currentNotices[matchedNoticeIndex] = targetNotice;
          mockData.set('deliveryNotices', currentNotices);

          // Update normal orders (销售单) delivery progress
          const salesOrderNo = targetNotice.orderNo || record.salesOrderNo;
          if (salesOrderNo && salesOrderNo !== '-') {
            const currentOrders = [...(normalOrders || [])];
            const orderIndex = currentOrders.findIndex(o => o.orderNo === salesOrderNo || o.id === salesOrderNo);
            if (orderIndex > -1) {
              const targetOrder = { ...currentOrders[orderIndex] };
              targetOrder.deliveryProgress = '已完成(备货取消)';
              targetOrder.deliveryProgressText = '备货计划关闭 (已发货数减少)';
              currentOrders[orderIndex] = targetOrder;
              mockData.set('normalOrders', currentOrders);
            }
          }
        } else {
          // Fallback: If notice not in list but order matches, update order progress directly
          const salesOrderNo = record.salesOrderNo || record.relOrderNo;
          if (salesOrderNo && salesOrderNo !== '-') {
            const currentOrders = [...(normalOrders || [])];
            const orderIndex = currentOrders.findIndex(o => o.orderNo === salesOrderNo || o.id === salesOrderNo);
            if (orderIndex > -1) {
              const targetOrder = { ...currentOrders[orderIndex] };
              targetOrder.deliveryProgress = '已完成(备货取消)';
              targetOrder.deliveryProgressText = '备货计划关闭 (已发货数减少)';
              currentOrders[orderIndex] = targetOrder;
              mockData.set('normalOrders', currentOrders);
            }
          }
        }

        // Save updated stocking plan
        mockData.upsert('stockingPlans', updatedRecord);
        message.success('备货计划已手动关闭！相关发货通知单及销售订单状态已同步更新。');
      }
    });
  };

  const handleJumpToOrder = (orderNo) => {
    if (!orderNo) return;
    if (orderNo.startsWith('DN')) {
      navigate('/delivery-notice', { state: { searchNo: orderNo } });
    } else if (orderNo.startsWith('REQ')) {
      navigate('/outbound', { state: { searchNo: orderNo } });
    } else if (orderNo.startsWith('OUT')) {
      navigate('/outbound', { state: { searchNo: orderNo } });
    } else {
       message.info(`跳转到单据: ${orderNo}`);
    }
  };

  const showDetail = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (text, record, index) => index + 1,
    },
    {
      title: '备货单号',
      dataIndex: 'planNo',
      key: 'planNo',
      width: 150,
      render: (text, record) => <a onClick={() => showDetail(record)}>{text}</a>
    },
    {
      title: '客户名称',
      key: 'customerName',
      width: 180,
      render: (_, record) => {
        const info = getPlanInfo(record);
        return info.customerName || '-';
      }
    },
    {
      title: '关联来源单据',
      dataIndex: 'relOrderNo',
      key: 'relOrderNo',
      width: 150,
      render: (text) => <a onClick={() => handleJumpToOrder(text)}>{text}</a>
    },
    {
      title: '关联出库单',
      dataIndex: 'outboundOrderNo',
      key: 'outboundOrderNo',
      width: 150,
      render: (text) => <a onClick={() => handleJumpToOrder(text)}>{text}</a>
    },
    {
      title: '出库类型',
      dataIndex: 'outboundType',
      key: 'outboundType',
      width: 120,
      render: (type) => (
        <Tag color={type === '销售出库' ? 'blue' : 'green'}>{type}</Tag>
      )
    },
    {
      title: '产品信息',
      dataIndex: 'productInfo',
      key: 'productInfo',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'processing';
        if (status === '确认出库') color = 'success';
        else if (status === '部分出库') color = 'orange';
        else if (status === '已关闭') color = 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '仓管员',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        if (record.status === '已关闭' || record.status === '确认出库') return null;
        return (
          <Space size="middle">
            <Button 
              type="link" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirmOutbound(record)}
            >
              确认出库
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <Card size="small" className="mb-4">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="planNo" label="备货单号">
            <Input placeholder="请输入单号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="relOrderNo" label="关联来源单据">
            <Input placeholder="请输入关联单号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="outboundOrderNo" label="关联出库单">
            <Input placeholder="请输入出库单号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="outboundType" label="出库类型">
            <Select placeholder="请选择" allowClear style={{ width: 120 }}>
              <Select.Option value="销售出库">销售出库</Select.Option>
              <Select.Option value="领料出库">领料出库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }}>
              <Select.Option value="未确认">未确认</Select.Option>
              <Select.Option value="部分出库">部分出库</Select.Option>
              <Select.Option value="确认出库">确认出库</Select.Option>
              <Select.Option value="已关闭">已关闭</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="productName" label="产品">
            <Input placeholder="产品关键字" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card size="small">
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条数据`,
            pageSize: 10,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Drawer
        title="备货计划详情"
        size="large"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {currentRecord && (() => {
          const productNames = currentRecord.productInfo ? currentRecord.productInfo.split(', ') : [];
          const planItems = currentRecord.items || productNames.map((name, index) => ({
            productCode: `PROD00${index + 1}`,
            productName: name,
            spec: index % 2 === 0 ? '1220*2440*18mm' : '1220*2440*15mm',
            model: index % 2 === 0 ? 'E0级' : 'E1级',
            quantity: index === 0 ? 5 : 12,
            warehouse: '主成品仓库',
            batchNo: index % 2 === 0 ? 'BAT202605A' : 'BAT202605B',
            location: index % 2 === 0 ? 'A-01-01' : 'B-02-01',
            isOutbound: currentRecord.status === '确认出库' || (currentRecord.status === '部分出库' && index === 0),
          }));
          const totalItemsCount = planItems.length;
          const shippedItems = planItems.filter(item => item.isOutbound);
          const shippedItemsCount = shippedItems.length;
          const pendingItems = planItems.filter(item => !item.isOutbound);
          const pendingItemsCount = pendingItems.length;
          const progressPercent = totalItemsCount > 0 ? Math.round((shippedItemsCount / totalItemsCount) * 100) : 0;
          const info = getPlanInfo(currentRecord);

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card size="small" className="bg-blue-50/50 border-blue-100">
                  <Statistic 
                    title="计划备货种数" 
                    value={totalItemsCount} 
                    suffix="种"
                    styles={{ content: { color: '#1d4ed8', fontSize: '18px', fontWeight: 600 } }}
                  />
                </Card>
                <Card size="small" className="bg-emerald-50/50 border-emerald-100">
                  <Statistic 
                    title="已出库种数" 
                    value={shippedItemsCount} 
                    suffix="种"
                    styles={{ content: { color: '#047857', fontSize: '18px', fontWeight: 600 } }}
                  />
                </Card>
                <Card size="small" className="bg-amber-50/50 border-amber-100">
                  <Statistic 
                    title="待出库种数" 
                    value={pendingItemsCount} 
                    suffix="种"
                    styles={{ content: { color: '#b45309', fontSize: '18px', fontWeight: 600 } }}
                  />
                </Card>
                <Card size="small" className="bg-purple-50/50 border-purple-100">
                  <Statistic 
                    title="备货完成率" 
                    value={progressPercent} 
                    suffix="%"
                    styles={{ content: { color: '#6b21a8', fontSize: '18px', fontWeight: 600 } }}
                  />
                </Card>
              </div>

              <Card size="small" title="计划基础内容" className="border-gray-150">
                <Descriptions column={2} size="small" bordered className="bg-white">
                  <Descriptions.Item label="备货单号" className="font-semibold">{currentRecord.planNo}</Descriptions.Item>
                  <Descriptions.Item label="出库类型">
                    <Tag color={currentRecord.outboundType === '销售出库' ? 'blue' : 'green'}>
                      {currentRecord.outboundType}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="关联来源单据">
                    <a className="font-semibold" onClick={() => handleJumpToOrder(currentRecord.relOrderNo)}>
                      {currentRecord.relOrderNo}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item label="备货计划状态">
                    {(() => {
                      let color = 'processing';
                      if (currentRecord.status === '确认出库') color = 'success';
                      else if (currentRecord.status === '部分出库') color = 'orange';
                      else if (currentRecord.status === '已关闭') color = 'default';
                      else if (currentRecord.status === '待关闭审核') color = 'warning';
                      return <Tag color={color}>{currentRecord.status}</Tag>;
                    })()}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓管员">{currentRecord.operator}</Descriptions.Item>
                  <Descriptions.Item label="操作时间">{currentRecord.operationTime || '-'}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Divider titlePlacement="left">备货产品分类监控</Divider>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      已出库产品 ({shippedItemsCount})
                    </span>
                  </div>
                  <Table
                    dataSource={shippedItems}
                    pagination={false}
                    size="small"
                    className="border"
                    rowKey="productCode"
                    locale={{ emptyText: <div className="text-gray-400 py-4 text-center">暂无已出库产品</div> }}
                    scroll={{ x: 1000 }}
                    columns={[
                      { 
                        title: '销售订单号', 
                        dataIndex: 'salesOrderNo', 
                        width: 140,
                        render: (v) => {
                          const orderNo = v || info.salesOrderNo;
                          if (!orderNo || orderNo === '-') return '-';
                          return (
                            <a onClick={() => {
                              setDetailVisible(false);
                              navigate('/sales-orders/normal', { state: { openDetail: orderNo } });
                            }} className="font-semibold">{orderNo}</a>
                          );
                        }
                      },
                      { 
                        title: '客户名称', 
                        dataIndex: 'customerName', 
                        width: 150, 
                        render: (v) => v || info.customerName || '-' 
                      },
                      { title: '产品编码', dataIndex: 'productCode', width: 120 },
                      { title: '产品名称', dataIndex: 'productName', width: 140 },
                      { title: '规格', dataIndex: 'spec', width: 120, render: v => v || '1220*2440*18mm' },
                      { title: '型号', dataIndex: 'model', width: 100, render: v => v || 'E0级' },
                      { title: '本次出库数量', dataIndex: 'quantity', width: 110, align: 'right', render: v => <span className="font-semibold text-emerald-600">{v}</span> },
                      { title: '出库单号', dataIndex: 'outboundOrderNo', width: 150, render: v => v || currentRecord.outboundOrderNo || 'OUT202605250001' },
                      { title: '出库仓库', dataIndex: 'warehouse', width: 130, render: v => v || '主成品仓库' },
                      { title: '批次号', dataIndex: 'batchNo', width: 125, render: v => v || '-' },
                      { title: '货位', dataIndex: 'location', width: 100, render: v => v || '-' }
                    ]}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      未出库(待出库)产品 ({pendingItemsCount})
                    </span>
                  </div>
                  <Table
                    dataSource={pendingItems}
                    pagination={false}
                    size="small"
                    className="border"
                    rowKey="productCode"
                    locale={{ emptyText: <div className="text-gray-400 py-4 text-center">所有产品已全部出库</div> }}
                    scroll={{ x: 800 }}
                    columns={[
                      { 
                        title: '销售订单号', 
                        dataIndex: 'salesOrderNo', 
                        width: 140,
                        render: (v) => {
                          const orderNo = v || info.salesOrderNo;
                          if (!orderNo || orderNo === '-') return '-';
                          return (
                            <a onClick={() => {
                              setDetailVisible(false);
                              navigate('/sales-orders/normal', { state: { openDetail: orderNo } });
                            }} className="font-semibold">{orderNo}</a>
                          );
                        }
                      },
                      { 
                        title: '客户名称', 
                        dataIndex: 'customerName', 
                        width: 150, 
                        render: (v) => v || info.customerName || '-' 
                      },
                      { title: '产品编码', dataIndex: 'productCode', width: 120 },
                      { title: '产品名称', dataIndex: 'productName' },
                      { title: '规格', dataIndex: 'spec', width: 120, render: v => v || '1220*2440*18mm' },
                      { title: '型号', dataIndex: 'model', width: 100, render: v => v || 'E0级' },
                      { title: '待发货数量', dataIndex: 'quantity', width: 100, align: 'right', render: v => <span className="font-semibold text-amber-600">{v}</span> }
                    ]}
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </Drawer>

      <Modal
        title="确认出库"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        onOk={() => confirmForm.submit()}
        width={1000}
        destroyOnHidden
      >
        {currentRecord && (
          <Form
            form={confirmForm}
            layout="vertical"
            onFinish={onConfirmFinish}
          >
            <Row gutter={24} className="mb-4 bg-gray-50 p-4 rounded">
              <Col span={8}>
                <Text type="secondary">备货单号：</Text>
                <Text strong>{currentRecord.planNo}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">关联来源单据：</Text>
                <Text strong>{currentRecord.relOrderNo}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">出库类型：</Text>
                <Tag color={currentRecord.outboundType === '销售出库' ? 'blue' : 'green'}>
                  {currentRecord.outboundType}
                </Tag>
              </Col>
            </Row>

            <Form.List name="items">
              {(fields) => {
                const tableColumns = [
                  {
                    title: '选择',
                    key: 'select',
                    width: 60,
                    render: (_, field) => {
                      const item = confirmForm.getFieldValue(['items', field.name]) || {};
                      const isAlreadyOutbound = item.isOutbound;
                      const isChecked = selectedRowKeys.includes(field.name);
                      return (
                        <Checkbox
                          disabled={isAlreadyOutbound}
                          checked={isAlreadyOutbound || isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRowKeys([...selectedRowKeys, field.name]);
                            } else {
                              setSelectedRowKeys(selectedRowKeys.filter(k => k !== field.name));
                            }
                          }}
                        />
                      );
                    },
                  },
                  {
                    title: '序号',
                    key: 'index',
                    width: 60,
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: '销售订单号',
                    key: 'salesOrderNo',
                    width: 140,
                    render: () => {
                      const info = getPlanInfo(currentRecord);
                      if (info.salesOrderNo === '-') return '-';
                      return (
                        <a onClick={() => {
                          setConfirmModalVisible(false);
                          navigate('/sales-orders/normal', { state: { openDetail: info.salesOrderNo } });
                        }}>{info.salesOrderNo}</a>
                      );
                    }
                  },
                  {
                    title: '客户名称',
                    key: 'customerName',
                    width: 150,
                    render: () => {
                      const info = getPlanInfo(currentRecord);
                      return info.customerName || '-';
                    }
                  },
                  {
                    title: '产品编码',
                    dataIndex: 'productCode',
                    key: 'productCode',
                    width: 120,
                    render: (_, { key, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={[restField.name, 'productCode']}
                        noStyle
                      >
                        <Text>PROD00{key + 1}</Text>
                      </Form.Item>
                    ),
                  },
                  {
                    title: '产品名称',
                    dataIndex: 'productName',
                    key: 'productName',
                    width: 150,
                    render: (_, { key, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={[restField.name, 'productName']}
                        noStyle
                      >
                        <Text>{confirmForm.getFieldValue(['items', restField.name, 'productName'])}</Text>
                      </Form.Item>
                    ),
                  },
                  {
                    title: '规格',
                    dataIndex: 'spec',
                    key: 'spec',
                    width: 140,
                    render: (_, { key, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={[restField.name, 'spec']}
                        noStyle
                      >
                        <Text>{confirmForm.getFieldValue(['items', restField.name, 'spec']) || '1220*2440*18mm'}</Text>
                      </Form.Item>
                    ),
                  },
                  {
                    title: '型号',
                    dataIndex: 'model',
                    key: 'model',
                    width: 110,
                    render: (_, { key, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={[restField.name, 'model']}
                        noStyle
                      >
                        <Text>{confirmForm.getFieldValue(['items', restField.name, 'model']) || 'E0级'}</Text>
                      </Form.Item>
                    ),
                  },
                  {
                    title: '本次出库数量',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 120,
                    render: (_, { key, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={[restField.name, 'quantity']}
                        noStyle
                      >
                        <Text>{confirmForm.getFieldValue(['items', restField.name, 'quantity'])}</Text>
                      </Form.Item>
                    ),
                  },
                  {
                    title: '出库仓库',
                    dataIndex: 'warehouse',
                    key: 'warehouse',
                    width: 160,
                    render: (_, { key, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={[restField.name, 'warehouse']}
                        rules={[{ required: true, message: '请选择仓库' }]}
                        noStyle
                      >
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          {warehouses.map(w => (
                            <Select.Option key={w.id} value={w.name}>{w.name}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ),
                  },
                  {
                    title: '批次号',
                    dataIndex: 'batchNo',
                    key: 'batchNo',
                    width: 160,
                    render: (_, { key, ...restField }) => {
                      const isPickType = currentRecord?.outboundType === '领料出库';
                      return (
                        <Form.Item
                          key={key}
                          {...restField}
                          name={[restField.name, 'batchNo']}
                          noStyle
                          initialValue={isPickType ? 'B20250501001' : undefined}
                        >
                          <Select 
                            disabled={isPickType} 
                            placeholder={isPickType ? "自动生成/只读" : "请选择"}
                            allowClear={!isPickType} 
                            style={{ width: '100%' }}
                          >
                            {batches.map(b => (
                              <Select.Option key={b.id} value={b.batchNo}>{b.batchNo}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    },
                  },
                  {
                    title: '货位',
                    dataIndex: 'location',
                    key: 'location',
                    width: 120,
                    render: (_, { key, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={[restField.name, 'location']}
                        noStyle
                      >
                        <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
                          <Select.Option value="A-01-01">A-01-01</Select.Option>
                          <Select.Option value="B-02-01">B-02-01</Select.Option>
                        </Select>
                      </Form.Item>
                    ),
                  },
                ];

                return (
                  <Table
                    dataSource={fields}
                    columns={tableColumns}
                    pagination={false}
                    size="small"
                  />
                );
              }}
            </Form.List>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default StockingPlanList;
