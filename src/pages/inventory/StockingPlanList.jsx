import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Form, Input, Select, Button, Space, Tag, Modal, message, Tooltip, Drawer, Row, Col, Typography, Checkbox, Statistic, Divider, Descriptions, InputNumber, Radio
} from 'antd';
const { Text } = Typography;
import { 
  SearchOutlined, 
  CheckCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  BarcodeOutlined,
  ScanOutlined,
  DeleteOutlined,
  PlusOutlined
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
  const [products] = useMockData('products');
  const [loading, setLoading] = useState(false);

  const getProductUnit = (productCode, productName) => {
    const normCode = productCode ? productCode.trim().toUpperCase() : '';
    const normName = productName ? productName.trim() : '';
    const found = (products || []).find(p => p.code === normCode || p.name === normName);
    if (found) return found.unit;
    if (normName.includes('皮沙发') || normCode.includes('PROD001') || normCode.includes('qi1') || normCode.includes('qi4')) return '个';
    if (normName.includes('餐桌') || normCode.includes('PROD002') || normCode.includes('qi2') || normCode.includes('qi5')) return '张';
    if (normName.includes('书架') || normCode.includes('PROD003') || normCode.includes('qi6') || normCode.includes('qi3') || normCode.includes('qi8')) return '组';
    if (normName.includes('铰链') || normCode.includes('ACC001')) return '对';
    if (normName.includes('板材') || normCode.includes('MAT001') || normCode.includes('qi7')) return 'm³';
    return '个';
  };

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
  const [formVersion, setFormVersion] = useState(0);

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustItemIndex, setAdjustItemIndex] = useState(-1);
  const [adjustTableData, setAdjustTableData] = useState([]);
  const [adjustMode, setAdjustMode] = useState('manual'); // 'manual' or 'scan'
  const [scanValue, setScanValue] = useState('');

  const handleScanAdd = (customValue) => {
    const rawVal = typeof customValue === 'string' ? customValue : scanValue;
    const trimmed = rawVal ? rawVal.trim() : '';
    if (!trimmed) {
      message.warning('请先输入或扫描序列号或产品码！');
      return;
    }
    
    // 1. Check duplicate
    const exists = adjustTableData.some(item => item.serialNo === trimmed);
    if (exists) {
      message.error(`该条码 [${trimmed}] 已在本次录入列表中，请勿重复扫码！`);
      return;
    }

    // 2. Format check simulation
    if (trimmed.startsWith('ERR_INVALID') || trimmed === 'INVALID_BARCODE') {
      message.error('条码格式无效！');
      return;
    }

    // 3. Occupied check simulation (序列号被占用)
    if (trimmed.startsWith('SN-OCCUPIED') || trimmed === 'SN_OCCUPIED_999') {
      message.error(`该序列号[${trimmed}]已存在于[OUT20260625008（出库单号）]中，不可出库`);
      return;
    }

    // 4. Mismatch check simulation
    if (trimmed.startsWith('SN-MISMATCH') || trimmed === 'SN_MISMATCH_888') {
      message.error('该序列号对应的商品并非本次待出库商品，无法录入');
      return;
    }
    
    // Check if total scanned would exceed the plan quantity
    const totalCurrentOutbound = adjustTableData.reduce((sum, item) => sum + (item.outboundQty || 0), 0);
    const items = confirmForm.getFieldValue('items') || [];
    const currentItem = items[adjustItemIndex] || {};
    const maxAllowed = currentItem.planQty - (currentItem.baseShippedQty || 0);
    
    if (totalCurrentOutbound + 1 > maxAllowed) {
      message.error(`❌ 扫码异常：本次出库总数已达到待出库数量上限（${maxAllowed} 个），无法继续录入！`);
      return;
    }

    const isProductCode = !trimmed.toUpperCase().startsWith('SN');

    const newRow = {
      key: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      serialNo: trimmed,
      isProductCode: isProductCode,
      warehouse: warehouses[0]?.name || '主成品仓库',
      batchNo: batches[0]?.batchNo || 'B20250501001',
      location: 'A-01-01',
      stockQty: isProductCode ? 150 : 1,
      outboundQty: 1
    };
    
    setAdjustTableData(prev => [...prev, newRow]);
    setScanValue('');
    message.success('录入成功');
  };

  const handleManualAddRow = () => {
    const newKey = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newRow = {
      key: newKey,
      warehouse: warehouses[0]?.name || '主成品仓库',
      batchNo: batches[0]?.batchNo || 'B20250501001',
      location: 'A-01-01',
      stockQty: currentRecord?.outboundType === '领料出库' ? 200 : 150,
      outboundQty: 0
    };
    setAdjustTableData(prev => [...prev, newRow]);
  };

  const handleOpenAdjustModal = (fieldIndex) => {
    setAdjustItemIndex(fieldIndex);
    const items = confirmForm.getFieldValue('items') || [];
    const item = items[fieldIndex] || {};
    let allocations = item.batchAllocations;
    const isPick = currentRecord?.outboundType === '领料出库';
    
    setAdjustMode('unified');
    
    if (!allocations || allocations.length === 0) {
      const maxAllowed = Math.max(0, (item.planQty || 0) - (item.baseShippedQty || 0));
      allocations = [
        {
          key: 1,
          warehouse: warehouses[0]?.name || '主成品仓库',
          batchNo: batches[0]?.batchNo || 'B20250501001',
          location: 'A-01-01',
          stockQty: isPick ? 200 : 150,
          outboundQty: maxAllowed
        }
      ];
    } else {
      allocations = allocations.map(alloc => ({
        ...alloc,
        location: alloc.location || 'A-01-01',
        stockQty: alloc.stockQty !== undefined ? alloc.stockQty : (isPick ? 200 : 150)
      }));
    }
    
    setAdjustTableData(allocations);
    setScanValue('');
    setAdjustModalVisible(true);
  };

  const handleSaveAdjust = () => {
    if (adjustItemIndex < 0) return;
    const totalOutboundQty = adjustTableData.reduce((sum, item) => sum + (item.outboundQty || 0), 0);
    const items = confirmForm.getFieldValue('items') || [];
    const currentItem = items[adjustItemIndex];
    if (currentItem) {
      const maxAllowed = currentItem.planQty - (currentItem.baseShippedQty || 0);
      if (totalOutboundQty > maxAllowed) {
        message.error(`❌ 保存失败：实出数量总和（${totalOutboundQty} 个）已超过待出库数量上限（${maxAllowed} 个）！`);
        return;
      }

      // Add check for stockQty: 实出数量不能大于库存数量 for each row
      for (const row of adjustTableData) {
        if (!row.serialNo) {
          const limit = row.stockQty !== undefined ? row.stockQty : 150;
          if ((row.outboundQty || 0) > limit) {
            message.error(`❌ 保存失败：在仓库 ${row.warehouse || ''} 中分配的实出数量（${row.outboundQty || 0} 个）不能大于其库存数量（${limit} 个）！`);
            return;
          }
        }
      }

      const updatedItem = { ...currentItem };
      updatedItem.totalOutboundQty = totalOutboundQty;
      updatedItem.quantity = totalOutboundQty;
      updatedItem.batchAllocations = adjustTableData;
      updatedItem.adjustMode = 'unified';
      
      const activeAlloc = adjustTableData.find(alloc => (alloc.outboundQty || 0) > 0) || adjustTableData[0];
      if (activeAlloc) {
        updatedItem.warehouse = activeAlloc.warehouse;
        updatedItem.batchNo = activeAlloc.batchNo;
        updatedItem.location = activeAlloc.location;
      }
      
      items[adjustItemIndex] = updatedItem;
      confirmForm.setFieldsValue({ items: [...items] });
      setFormVersion(v => v + 1);
    }
    setAdjustModalVisible(false);
    message.success('仓库/批次调整保存成功！');
  };

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
    const initialItems = (record.items || productNames.map((name, index) => ({
      productCode: `PROD00${index + 1}`,
      productName: name,
      spec: index % 2 === 0 ? '1220*2440*18mm' : '1220*2440*15mm',
      model: index % 2 === 0 ? 'E0级' : 'E1级',
      quantity: index === 0 ? 5 : 12,
      planQty: index === 0 ? 5 : 12,
      warehouse: '主成品仓库',
      isOutbound: record.status === '确认出库',
      processName: index % 3 === 0 ? '开料工序' : (index % 3 === 1 ? '封边工序' : '包装工序'),
    }))).map((item, index) => {
      const planQty = item.planQty || item.quantity || (index === 0 ? 5 : 12);
      const isFullyShipped = item.isOutbound || record.status === '确认出库';
      let baseShippedQty = item.baseShippedQty !== undefined ? item.baseShippedQty : 0;
      if (isFullyShipped) {
        baseShippedQty = planQty;
      } else if (record.status === '部分出库' && index === 0 && item.baseShippedQty === undefined) {
        baseShippedQty = Math.floor(planQty * 0.6);
      }
      
      const defaultTotalOutboundQty = Math.max(0, planQty - baseShippedQty);
      return {
        ...item,
        planQty,
        baseShippedQty,
        totalOutboundQty: defaultTotalOutboundQty,
        unit: item.unit || getProductUnit(item.productCode, item.productName),
        processName: item.processName || (index % 3 === 0 ? '开料工序' : (index % 3 === 1 ? '封边工序' : '包装工序'))
      };
    });
    confirmForm.setFieldsValue({ items: initialItems, remark: record.remark || '' });
    
    // Select all items by default because the select column is deleted
    const allKeys = initialItems.map((_, idx) => idx);
    setSelectedRowKeys(allKeys);
    setFormVersion(v => v + 1);
    
    setConfirmModalVisible(true);
  };

  const onConfirmFinish = (values) => {
    const formItems = values.items || [];
    const remark = values.remark || '';
    const selectedItemsToOutbound = formItems.filter((item, index) => {
      return selectedRowKeys.includes(index) && !item.isOutbound;
    });

    if (selectedItemsToOutbound.length === 0) {
      message.warning('没有需要出库的物料产品或产品均已全额出库完毕！');
      return;
    }

    // Update items array, setting isOutbound: true for chosen items if they are fully shipped
    const updatedItems = formItems.map((item, index) => {
      if (selectedRowKeys.includes(index)) {
        const outboundQty = item.totalOutboundQty !== undefined ? item.totalOutboundQty : Math.max(0, (item.planQty || 0) - (item.baseShippedQty || 0));
        const newShipped = (item.baseShippedQty || 0) + outboundQty;
        const isFullyShipped = newShipped >= (item.planQty || 0);
        return { 
          ...item, 
          baseShippedQty: newShipped,
          quantity: newShipped,
          isOutbound: isFullyShipped 
        };
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
      remark: remark,
      items: selectedItemsToOutbound.map(item => {
        const outboundQty = item.totalOutboundQty !== undefined ? item.totalOutboundQty : Math.max(0, (item.planQty || 0) - (item.baseShippedQty || 0));
        return {
          productCode: item.productCode,
          productName: item.productName,
          spec: item.spec,
          quantity: outboundQty,
          outboundQty: outboundQty,
          warehouseName: item.warehouse || '主成品仓库',
          batchNo: item.batchNo || 'B20250501001',
          location: item.location || 'A-01-01',
          price: 2000
        };
      }),
      totalQty: selectedItemsToOutbound.reduce((acc, item) => {
        const outboundQty = item.totalOutboundQty !== undefined ? item.totalOutboundQty : Math.max(0, (item.planQty || 0) - (item.baseShippedQty || 0));
        return acc + outboundQty;
      }, 0),
    };

    mockData.upsert('outboundOrders', mockOutbound);

    const updatedRecord = { 
      ...currentRecord, 
      status: finalStatus,
      outboundOrderNo: newOutboundOrderNo,
      operationTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      items: updatedItems,
      remark: remark
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

  const handleExport = (record) => {
    const hideMessage = message.loading(`正在准备备货计划 [${record.planNo}] 的数据...`, 0);
    setTimeout(() => {
      hideMessage();
      const productNames = record.productInfo ? record.productInfo.split(', ') : [];
      const planItems = record.items || productNames.map((name, index) => ({
        productCode: `PROD00${index + 1}`,
        productName: name,
        spec: index % 2 === 0 ? '1220*2440*18mm' : '1220*2440*15mm',
        model: index % 2 === 0 ? 'E0级' : 'E1级',
        quantity: index === 0 ? 5 : 12,
        isOutbound: record.status === '确认出库' || (record.status === '部分出库' && index === 0),
      }));

      const info = getPlanInfo(record);
      const csvRows = [
        ['备货计划管理数据导出'],
        [],
        ['备货单号', record.planNo],
        ['关联订单/来源', record.relOrderNo || '-'],
        ['客户名称', info.customerName || '-'],
        ['出库类型', record.outboundType || '-'],
        ['状态', record.status || '-'],
        ['操作人', record.operator || '-'],
        ['操作时间', record.operationTime || '-'],
        [],
        ['序号', '产品编码', '产品名称', '规格', '型号', '单位', '数量', '出库状态']
      ];

      planItems.forEach((item, idx) => {
        csvRows.push([
          idx + 1,
          item.productCode,
          item.productName,
          item.spec,
          item.model,
          getProductUnit(item.productCode, item.productName),
          item.quantity,
          item.isOutbound ? '已出库' : '待出库'
        ]);
      });

      const csvContent = "\uFEFF" + csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `备货计划_${record.planNo}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`备货计划 [${record.planNo}] 导出成功！`);
    }, 800);
  };

  const isPlanFullyShipped = (record) => {
    if (record.status === '已关闭') return true;
    const productNames = record.productInfo ? record.productInfo.split(', ') : [];
    const items = record.items || productNames.map((name, index) => {
      const planQty = index === 0 ? 5 : 12;
      let baseShippedQty = 0;
      if (record.status === '确认出库') {
        baseShippedQty = planQty;
      } else if (record.status === '部分出库' && index === 0) {
        baseShippedQty = Math.floor(planQty * 0.6);
      }
      return {
        planQty,
        baseShippedQty,
      };
    });
    return items.every(item => {
      const planQty = item.planQty || item.quantity || 0;
      const baseShippedQty = item.baseShippedQty || 0;
      return baseShippedQty >= planQty;
    });
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
      title: '产品种类数量',
      key: 'productCount',
      width: 120,
      render: (_, record) => {
        if (record.items && record.items.length > 0) {
          return `${record.items.length} 种`;
        }
        if (record.productInfo) {
          const names = record.productInfo.split(',').map(s => s.trim()).filter(Boolean);
          return `${names.length} 种`;
        }
        return '0 种';
      }
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
      render: (v) => v || '-'
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        const canOutbound = record.status !== '已关闭' && (record.status === '部分出库' || !isPlanFullyShipped(record));
        return (
          <Space size="middle">
            {canOutbound && (
              <Button 
                type="link" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirmOutbound(record)}
              >
                确认出库
              </Button>
            )}
            <Button 
              type="link" 
              size="small" 
              icon={<ExportOutlined />}
              onClick={() => handleExport(record)}
            >
              导出
            </Button>
          </Space>
        );
      },
    },
  ];

  const getAdjustColumns = () => {
    const cols = [
      {
        title: '序号',
        key: 'index',
        width: 60,
        render: (_, __, idx) => idx + 1,
      },
      {
        title: '序列号',
        dataIndex: 'serialNo',
        key: 'serialNo',
        width: 180,
        render: (value, record) => {
          if (value) {
            if (record.isProductCode) {
              return null;
            }
            return <Text copyable font-mono>{value} (序列号)</Text>;
          }
          return <Text type="secondary">- (手动新增)</Text>;
        }
      },
    ];

    cols.push(
      {
        title: '仓库',
        dataIndex: 'warehouse',
        key: 'warehouse',
        width: 150,
        render: (value, record) => (
          <Select
            value={value}
            placeholder="请选择仓库"
            disabled={record.serialNo && !record.isProductCode}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, warehouse: val };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          >
            {warehouses.map(w => (
              <Select.Option key={w.id} value={w.name}>{w.name}</Select.Option>
            ))}
          </Select>
        )
      },
      {
        title: '批次号',
        dataIndex: 'batchNo',
        key: 'batchNo',
        width: 150,
        render: (value, record) => (
          <Select
            value={value}
            placeholder="请选择批次"
            disabled={!!record.serialNo}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, batchNo: val };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          >
            {batches.map(b => (
              <Select.Option key={b.id} value={b.batchNo}>{b.batchNo}</Select.Option>
            ))}
          </Select>
        )
      },
      {
        title: '货位',
        dataIndex: 'location',
        key: 'location',
        width: 140,
        render: (value, record) => (
          <Select
            value={value || 'A-01-01'}
            placeholder="请选择货位"
            disabled={record.serialNo && !record.isProductCode}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, location: val };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          >
            {['A-01-01', 'A-01-02', 'B-02-01', 'B-02-02', 'C-03-01', 'C-03-02'].map(loc => (
              <Select.Option key={loc} value={loc}>{loc}</Select.Option>
            ))}
          </Select>
        )
      }
    );

    cols.push({
      title: '库存数量',
      dataIndex: 'stockQty',
      key: 'stockQty',
      width: 110,
      render: (value, record) => {
        if (record.serialNo && !record.isProductCode) {
          return <Text type="secondary">- (序列号唯一)</Text>;
        }
        return value !== undefined ? <Text className="font-semibold text-blue-600">{value} 个</Text> : <Text type="secondary">150 个</Text>;
      }
    });

    cols.push({
      title: '实出数量',
      dataIndex: 'outboundQty',
      key: 'outboundQty',
      width: 130,
      render: (value, record) => {
        if (record.serialNo && !record.isProductCode) {
          return <Text strong style={{ color: '#52c41a' }}>1 个</Text>;
        }
        const limit = record.stockQty !== undefined ? record.stockQty : 150;
        const isError = (value || 0) > limit;
        return (
          <InputNumber
            min={0}
            value={value}
            status={isError ? 'error' : ''}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, outboundQty: val || 0 };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          />
        );
      }
    });

    cols.push({
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => {
            setAdjustTableData(prev => prev.filter(item => item.key !== record.key));
          }}
        />
      )
    });

    return cols;
  };

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
          const planItems = (currentRecord.items || productNames.map((name, index) => ({
            productCode: `PROD00${index + 1}`,
            productName: name,
            spec: index % 2 === 0 ? '1220*2440*18mm' : '1220*2440*15mm',
            model: index % 2 === 0 ? 'E0级' : 'E1级',
            quantity: index === 0 ? 5 : 12,
            warehouse: '主成品仓库',
            batchNo: index % 2 === 0 ? 'BAT202605A' : 'BAT202605B',
            location: index % 2 === 0 ? 'A-01-01' : 'B-02-01',
            isOutbound: currentRecord.status === '确认出库' || (currentRecord.status === '部分出库' && index === 0),
            processName: index % 3 === 0 ? '开料工序' : (index % 3 === 1 ? '封边工序' : '包装工序'),
          }))).map((item, index) => {
            let displaySerialNo = '-';
            if (item.batchAllocations && item.batchAllocations.length > 0) {
              const sns = item.batchAllocations.map(a => a.serialNo).filter(Boolean);
              if (sns.length > 0) {
                displaySerialNo = sns.join(', ');
              }
            } else if (item.isOutbound) {
              displaySerialNo = `SN-2026-06${7000 + index * 100 + 42}`;
            }
            return {
              ...item,
              serialNo: item.serialNo || displaySerialNo,
              unit: item.unit || getProductUnit(item.productCode, item.productName),
              processName: item.processName || (index % 3 === 0 ? '开料工序' : (index % 3 === 1 ? '封边工序' : '包装工序'))
            };
          });
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
                  <Descriptions.Item label="操作时间" span={2}>{currentRecord.operationTime || '-'}</Descriptions.Item>
                  <Descriptions.Item label="出库备注" span={2}>{currentRecord.remark || '-'}</Descriptions.Item>
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
                    scroll={{ x: 1150 }}
                    columns={[
                      { 
                        title: '销售订单号/生产工单号', 
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
                      { title: '序列号', dataIndex: 'serialNo', width: 150, render: v => <span className="font-mono text-gray-600">{v || '-'}</span> },
                      { title: '工序名称', dataIndex: 'processName', width: 100, render: v => v || '-' },
                      { title: '单位', dataIndex: 'unit', width: 70, align: 'center', render: v => v || '个' },
                      { title: '规格', dataIndex: 'spec', width: 120, render: v => v || '1220*2440*18mm' },
                      { title: '型号', dataIndex: 'model', width: 100, render: v => v || 'E0级' },
                      { title: '应出数量', dataIndex: 'quantity', width: 110, align: 'right', render: v => <span className="font-semibold text-emerald-600">{v}</span> },
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
                        title: '销售订单号/生产工单号', 
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
                      { title: '工序名称', dataIndex: 'processName', width: 100, render: v => v || '-' },
                      { title: '单位', dataIndex: 'unit', width: 70, align: 'center', render: v => v || '个' },
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
              <Col span={12}>
                <Text type="secondary">备货单号：</Text>
                <Text strong>{currentRecord.planNo}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">关联来源单据：</Text>
                <Text strong>{currentRecord.relOrderNo}</Text>
              </Col>
            </Row>

            <Form.List name="items">
               {(fields) => {
                 const tableColumns = [
                   {
                     title: '序号',
                     key: 'index',
                     width: 60,
                     fixed: 'left',
                     render: (_, __, index) => index + 1,
                   },
                   {
                     title: '销售订单号/生产工单号',
                     key: 'salesOrderNo',
                     width: 140,
                     fixed: 'left',
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
                     title: '产品编码',
                     dataIndex: 'productCode',
                     key: 'productCode',
                     width: 120,
                     fixed: 'left',
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
                     fixed: 'left',
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
                     title: '工序名称',
                     key: 'processName',
                     width: 110,
                     render: (_, { key, ...restField }) => (
                       <Form.Item
                         key={key}
                         {...restField}
                         name={[restField.name, 'processName']}
                         noStyle
                       >
                         <Text>{confirmForm.getFieldValue(['items', restField.name, 'processName']) || '开料工序'}</Text>
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
                     title: '单位',
                     key: 'unit',
                     width: 90,
                     align: 'center',
                     render: (_, { key, ...restField }) => (
                       <Form.Item
                         key={key}
                         {...restField}
                         name={[restField.name, 'unit']}
                         noStyle
                       >
                         <Text>{confirmForm.getFieldValue(['items', restField.name, 'unit']) || '个'}</Text>
                       </Form.Item>
                     ),
                   },
                   {
                     title: '应出数量',
                     key: 'planQty',
                     width: 110,
                     align: 'right',
                     render: (_, field) => {
                       const item = confirmForm.getFieldValue(['items', field.name]) || {};
                       const planQty = item.planQty || 0;
                       return <Text className="font-semibold text-blue-600">{planQty}</Text>;
                     }
                   },
                   {
                     title: '待出库数量',
                     key: 'pendingOutboundQty',
                     width: 110,
                     align: 'right',
                     render: (_, field) => {
                       const item = confirmForm.getFieldValue(['items', field.name]) || {};
                       const planQty = item.planQty || 0;
                       const baseShippedQty = item.baseShippedQty || 0;
                       const currentPending = Math.max(0, planQty - baseShippedQty);
                       return <Text className="font-semibold text-amber-600">{currentPending}</Text>;
                     }
                   },
                   {
                     title: '已出库数量',
                     key: 'shippedQty',
                     width: 110,
                     align: 'right',
                     render: (_, field) => {
                       const item = confirmForm.getFieldValue(['items', field.name]) || {};
                       const baseShippedQty = item.baseShippedQty || 0;
                       return <Text className="font-semibold text-green-600">{baseShippedQty}</Text>;
                     }
                   },
                   {
                     title: '本次出库数量',
                     key: 'totalOutboundQty',
                     width: 110,
                     align: 'right',
                     render: (_, field) => {
                       const item = confirmForm.getFieldValue(['items', field.name]) || {};
                       const totalOutboundQty = item.totalOutboundQty || 0;
                       return <Text className="font-semibold text-blue-600">{totalOutboundQty}</Text>;
                     }
                   },
                   {
                     title: '操作',
                     key: 'action',
                     width: 150,
                     align: 'center',
                     fixed: 'right',
                     render: (_, { name }) => {
                       return (
                         <Button 
                           type="link" 
                           size="small" 
                           onClick={() => handleOpenAdjustModal(name)}
                         >
                           调整仓库/批次
                         </Button>
                       );
                     },
                   },
                 ];

                return (
                  <Table
                    dataSource={fields}
                    columns={tableColumns}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1400 }}
                  />
                );
              }}
            </Form.List>
            
            <div className="mt-4 border-t pt-4">
              <Form.Item name="remark" label="出库备注">
                <Input.TextArea rows={2} placeholder="请输入出库备注" maxLength={200} showCount />
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>

      {/* 二级页面：调整仓库/批次 */}
      <Modal
        title="调整仓库/批次"
        open={adjustModalVisible}
        onOk={handleSaveAdjust}
        onCancel={() => setAdjustModalVisible(false)}
        width={750}
        destroyOnHidden
        okText="确定"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <span>
              <Text strong>产品名称: </Text>
              <Text type="secondary">
                {adjustItemIndex >= 0 ? confirmForm.getFieldValue(['items', adjustItemIndex, 'productName']) : ''}
              </Text>
            </span>
            <span>
              <Text strong>计划出库数量: </Text>
              <Text type="secondary">
                {adjustItemIndex >= 0 ? confirmForm.getFieldValue(['items', adjustItemIndex, 'planQty']) : ''}
              </Text>
            </span>
            <span>
              <Text strong>当前调整后总数: </Text>
              <Text className="font-semibold text-green-600">
                {adjustTableData.reduce((sum, item) => sum + (item.outboundQty || 0), 0)} 个
              </Text>
            </span>
          </Space>
        </div>

        {/* 扫码录入的部件占满一行 */}
        <div style={{ marginBottom: 16, padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: '600', marginBottom: 8, color: '#262626' }}>
            🔍 扫码录入：
          </div>
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
            <Space>
              <BarcodeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
              <Input
                placeholder="请输入序列号/产品码或扫描条码并回车"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                onPressEnter={() => handleScanAdd()}
                style={{ width: 240 }}
                allowClear
              />
              <Button type="primary" onClick={() => handleScanAdd()}>录入</Button>
            </Space>
          </Space>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', marginBottom: 4 }}>
              💡 模拟扫码测试工具箱（快捷触发扫码及各种异常检测）：
            </div>
            <Space wrap size="small">
              <Button 
                size="small" 
                onClick={() => handleScanAdd(`SN-2026-06${Math.floor(Math.random() * 9000 + 1000)}`)}
                style={{ color: '#2f54eb', borderColor: '#adc6ff', background: '#f0f5ff', fontSize: '11px' }}
              >
                🟢 扫码序列号
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd(`PROD-WOOD-${Math.floor(Math.random() * 900 + 100)}`)}
                style={{ color: '#096dd9', borderColor: '#91d5ff', background: '#e6f7ff', fontSize: '11px' }}
              >
                🔵 扫码产品码 (可改仓库/数量)
              </Button>
              <Button 
                size="small" 
                onClick={() => {
                  if (adjustTableData.length > 0 && adjustTableData.some(i => i.serialNo)) {
                    const firstScanned = adjustTableData.find(i => i.serialNo);
                    handleScanAdd(firstScanned.serialNo);
                  } else {
                    const dummy = 'SN-2026-069999';
                    handleScanAdd(dummy);
                    setTimeout(() => handleScanAdd(dummy), 300);
                  }
                }}
                style={{ color: '#fa8c16', borderColor: '#ffd591', background: '#fff7e6', fontSize: '11px' }}
              >
                ⚠️ 重复扫码
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd('ERR_INVALID_CODE')}
                style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
              >
                ❌ 格式错误
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd('SN-OCCUPIED_999')}
                style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
              >
                ❌ 被占用
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd('SN-MISMATCH_888')}
                style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
              >
                ❌ 商品不匹配
              </Button>
            </Space>
          </div>
        </div>

        {/* 下一行的右边 放 手动分配数量按钮 */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleManualAddRow}
          >
            手动分配数量
          </Button>
        </div>

        <Table
          dataSource={adjustTableData}
          pagination={false}
          size="small"
          rowKey="key"
          columns={getAdjustColumns()}
        />

      </Modal>
    </div>
  );
};

export default StockingPlanList;
