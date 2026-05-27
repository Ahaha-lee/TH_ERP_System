import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Select, 
  DatePicker, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Row, 
  Col,
  Modal,
  InputNumber,
  message,
  Tooltip,
  Input,
  Switch
} from 'antd';
import { DeleteOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useMockData } from '../../mock/data';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PriceStrategyLedger = () => {
  const [data, setData] = useMockData('priceStrategiesLedger');
  
  // Search states
  const [category, setCategory] = useState(null);
  const [level, setLevel] = useState(null);
  const [region, setRegion] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [strategyList, setStrategyList] = useState([]);
  const [activeRowId, setActiveRowId] = useState(null);

  // Product dimension states
  const [allProducts] = useMockData('products');
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tempSelectedProducts, setTempSelectedProducts] = useState([]);
  const [tempSelectedRowKeys, setTempSelectedRowKeys] = useState([]);
  const [productCodeQuery, setProductCodeQuery] = useState('');
  const [productNameQuery, setProductNameQuery] = useState('');
  const [productCategoryQuery, setProductCategoryQuery] = useState('全部');

  // Customer dimension states
  const [allCustomers] = useMockData('customers');
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [tempSelectedCustomerKey, setTempSelectedCustomerKey] = useState(null);
  const [tempSelectedCustomer, setTempSelectedCustomer] = useState(null);
  const [customerNameQuery, setCustomerNameQuery] = useState('');
  const [customerCodeQuery, setCustomerCodeQuery] = useState('');

  // Options
  const categories = ['经销商', '零售', '分销商', '大客户', '独立店'];
  const levels = ['S级', 'A级', 'B级', 'C级'];
  const regions = ['华东', '华南', '华北', '华中', '西南', '西北', '东北', '全国'];

  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      if (category && item.customerCategory !== category) return false;
      if (level && item.customerLevel !== level) return false;
      if (region && item.customerRegion !== region) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dayjs(dateRange[0]);
        const end = dayjs(dateRange[1]);
        const itemStart = dayjs(item.effectiveDate);
        const itemEnd = dayjs(item.expiryDate);
        if (itemStart.isAfter(end) || itemEnd.isBefore(start)) return false;
      }
      return true;
    });
  }, [data, category, level, region, dateRange]);

  const handleReset = () => {
    setCategory(null);
    setLevel(null);
    setRegion(null);
    setDateRange(null);
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now() + Math.random(),
      strategyDimension: '客户类型',
      dimensionValue: [],
      selectedCustomer: null,
      effectiveDate: null,
      expiryDate: null,
      discountVal: 0,
      isStarted: false
    };
    setStrategyList([...strategyList, newRow]);
  };

  const openCustomerSelector = (rowId) => {
    setActiveRowId(rowId);
    const row = strategyList.find(s => s.id === rowId);
    if (row && row.selectedCustomer) {
      setTempSelectedCustomerKey(row.selectedCustomer.id);
      setTempSelectedCustomer(row.selectedCustomer);
    } else {
      setTempSelectedCustomerKey(null);
      setTempSelectedCustomer(null);
    }
    setCustomerModalVisible(true);
  };

  const openProductSelector = (rowId) => {
    setActiveRowId(rowId);
    const row = strategyList.find(s => s.id === rowId);
    const currentVals = row?.dimensionValue || [];
    const selectedCodes = currentVals.map(val => val.split('/')[0]);
    const matchingProducts = (allProducts || []).filter(p => selectedCodes.includes(p.code));
    setTempSelectedProducts(matchingProducts);
    setTempSelectedRowKeys(matchingProducts.map(p => p.id));
    setProductModalVisible(true);
  };

  const removeStrategy = (id) => {
    setStrategyList(prev => prev.filter(s => s.id !== id));
  };

  const updateStrategy = (id, fieldOrFields, value) => {
    setStrategyList(prev => prev.map(s => {
      if (s.id === id) {
        if (typeof fieldOrFields === 'object') {
          return { ...s, ...fieldOrFields };
        }
        return { ...s, [fieldOrFields]: value };
      }
      return s;
    }));
  };

  const getStatusInfo = (effectiveDate, expiryDate) => {
    const today = dayjs().startOf('day');
    const start = dayjs(effectiveDate).startOf('day');
    const end = dayjs(expiryDate).endOf('day');

    if (today.isBefore(start)) {
      return { text: '待生效', color: 'blue' };
    } else if (today.isAfter(end)) {
      return { text: '失效', color: 'red' };
    } else {
      return { text: '生效', color: 'green' };
    }
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setEditingId(record.id);
    setModalVisible(true);
    
    // In edit mode, we pre-fill the strategy list with the current record
    const statusInfo = getStatusInfo(record.effectiveDate, record.expiryDate);
    
    let resolvedDimension = record.strategyDimension;
    let resolvedValueStr = record.dimensionValue;
    
    if (!resolvedDimension) {
      if (record.customerCategory) {
        resolvedDimension = '客户类型';
        resolvedValueStr = record.customerCategory;
      } else if (record.customerLevel) {
        resolvedDimension = '客户等级';
         resolvedValueStr = record.customerLevel;
      } else if (record.customerRegion) {
        resolvedDimension = '客户区域';
        resolvedValueStr = record.customerRegion;
      } else if (record.productInfo) {
        resolvedDimension = '客户+产品';
        resolvedValueStr = record.productInfo;
      } else {
        resolvedDimension = '客户类型';
        resolvedValueStr = '';
      }
    } else if (resolvedDimension === '产品') {
      resolvedDimension = '客户+产品';
    }

    const resolvedValue = resolvedValueStr ? resolvedValueStr.split(/[\/,]/) : [];

    let customer = record.selectedCustomer || null;
    if (!customer && (record.customerName || record.customerCode)) {
      customer = {
        name: record.customerName || '宜居美学',
        code: record.customerCode || 'CUS002'
      };
    } else if (!customer && resolvedDimension === '客户+产品') {
      customer = {
        id: 'cus2',
        code: 'CUS002',
        name: '宜居美学',
        type: '零售',
        level: 'B级',
        region: '华南'
      };
    }

    const recordStrategy = {
      id: record.id,
      strategyDimension: resolvedDimension,
      dimensionValue: resolvedValue,
      selectedCustomer: customer,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : null,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
      discountVal: Math.round((1 - record.discountRate) * 100),
      isStarted: statusInfo.text !== '待生效' // Helper to check if started
    };
    setStrategyList([recordStrategy]);
  };

  const handleDelete = (record) => {
    const statusInfo = getStatusInfo(record.effectiveDate, record.expiryDate);
    if (statusInfo.text !== '待生效') {
      message.error('只有待生效的策略可以删除');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条待生效的价格策略吗？删除后不可恢复。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        setData(data.filter(item => item.id !== record.id));
        message.success('删除成功');
      },
    });
  };

  const handleSave = () => {
    if (strategyList.length === 0) {
      message.warning('请至少添加一条策略数据');
      return;
    }

    // Validation
    const invalid = strategyList.filter(s => {
      if (!s.strategyDimension || !s.effectiveDate || !s.expiryDate) return true;
      if (s.strategyDimension === '客户+产品') {
        return !s.selectedCustomer || !s.dimensionValue || s.dimensionValue.length === 0;
      }
      return !s.dimensionValue || s.dimensionValue.length === 0;
    });
    if (invalid.length > 0) {
      message.error('请填写完整的策略维度、维度值（包括客户与产品）、生效日期和失效日期');
      return;
    }

    if (isEditMode) {
      // Single record edit
      const updatedStrategy = strategyList[0];
      const updatedData = data.map(item => {
        if (item.id === editingId) {
          const effectiveDateStr = updatedStrategy.effectiveDate.format('YYYY-MM-DD');
          const expiryDateStr = updatedStrategy.expiryDate.format('YYYY-MM-DD');
          
          let customerCategory = '';
          let customerLevel = '';
          let customerRegion = '';
          let productInfo = '';

          const dimValStr = updatedStrategy.dimensionValue.join(',');
          if (updatedStrategy.strategyDimension === '客户类型') {
            customerCategory = dimValStr;
          } else if (updatedStrategy.strategyDimension === '客户等级') {
            customerLevel = dimValStr;
          } else if (updatedStrategy.strategyDimension === '客户区域') {
            customerRegion = dimValStr;
          } else if (updatedStrategy.strategyDimension === '产品' || updatedStrategy.strategyDimension === '客户+产品') {
            productInfo = dimValStr;
          }

          return {
            ...item,
            effectiveDate: effectiveDateStr,
            expiryDate: expiryDateStr,
            discountRate: (100 - updatedStrategy.discountVal) / 100,
            strategyDimension: updatedStrategy.strategyDimension,
            dimensionValue: dimValStr,
            customerCategory,
            customerLevel,
            customerRegion,
            productInfo,
            selectedCustomer: updatedStrategy.selectedCustomer,
            customerName: updatedStrategy.selectedCustomer?.name || '',
            customerCode: updatedStrategy.selectedCustomer?.code || '',
            operator: '管理员', // Mock current user
            operationTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
        }
        return item;
      });
      setData(updatedData);
      message.success('修改成功');
    } else {
      // Batch add
      const newItems = strategyList.map(s => {
        let customerCategory = '';
        let customerLevel = '';
        let customerRegion = '';
        let productInfo = '';

        const dimValStr = s.dimensionValue.join(',');
        if (s.strategyDimension === '客户类型') {
          customerCategory = dimValStr;
        } else if (s.strategyDimension === '客户等级') {
          customerLevel = dimValStr;
        } else if (s.strategyDimension === '客户区域') {
          customerRegion = dimValStr;
        } else if (s.strategyDimension === '产品' || s.strategyDimension === '客户+产品') {
          productInfo = dimValStr;
        }

        return {
          id: `psl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          code: `PS${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          strategyDimension: s.strategyDimension,
          dimensionValue: dimValStr,
          customerCategory,
          customerLevel,
          customerRegion,
          productInfo,
          selectedCustomer: s.selectedCustomer,
          customerName: s.selectedCustomer?.name || '',
          customerCode: s.selectedCustomer?.code || '',
          effectiveDate: s.effectiveDate.format('YYYY-MM-DD'),
          expiryDate: s.expiryDate.format('YYYY-MM-DD'),
          discountRate: (100 - s.discountVal) / 100,
          operator: '管理员', // Mock current user
          operationTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          enabled: true,
        };
      });
      setData([...newItems, ...data]);
      message.success('新增成功');
    }

    setModalVisible(false);
  };

  const modalColumns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: '策略维度',
      key: 'strategyDimension',
      width: 150,
      render: (_, record) => (
        <Select 
          value={record.strategyDimension || undefined} 
          className="w-full"
          onChange={(val) => {
            updateStrategy(record.id, { strategyDimension: val, dimensionValue: [] });
          }}
          placeholder="请选择"
          disabled={record.isStarted}
        >
          <Select.Option value="客户类型">客户类型</Select.Option>
          <Select.Option value="客户等级">客户等级</Select.Option>
          <Select.Option value="客户区域">客户区域</Select.Option>
          <Select.Option value="客户+产品">客户+产品</Select.Option>
        </Select>
      )
    },
    {
      title: '维度值',
      key: 'dimensionValue',
      width: 280,
      render: (_, record) => {
        if (record.strategyDimension === '客户类型') {
          return (
            <Select
              mode="multiple"
              placeholder="请选择"
              className="w-full"
              value={record.dimensionValue || []}
              onChange={(vals) => updateStrategy(record.id, 'dimensionValue', vals)}
              maxTagCount="responsive"
              disabled={record.isStarted}
            >
              {categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          );
        }
        if (record.strategyDimension === '客户等级') {
          return (
            <Select
              mode="multiple"
              placeholder="请选择"
              className="w-full"
              value={record.dimensionValue || []}
              onChange={(vals) => updateStrategy(record.id, 'dimensionValue', vals)}
              maxTagCount="responsive"
              disabled={record.isStarted}
            >
              {levels.map(l => <Select.Option key={l} value={l}>{l}</Select.Option>)}
            </Select>
          );
        }
        if (record.strategyDimension === '客户区域') {
          return (
            <Select
              mode="multiple"
              placeholder="请选择"
              className="w-full"
              value={record.dimensionValue || []}
              onChange={(vals) => updateStrategy(record.id, 'dimensionValue', vals)}
              maxTagCount="responsive"
              disabled={record.isStarted}
            >
              {regions.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
            </Select>
          );
        }
        if (record.strategyDimension === '产品' || record.strategyDimension === '客户+产品') {
          return (
            <div className="flex flex-col gap-1.5 py-1">
              <div>
                <div className="text-[10px] text-gray-400 mb-0.5">客户 *</div>
                <Input 
                  placeholder="点击选择客户" 
                  readOnly 
                  onClick={() => {
                    if (record.isStarted) return;
                    openCustomerSelector(record.id);
                  }}
                  value={record.selectedCustomer ? `${record.selectedCustomer.name}/${record.selectedCustomer.code}` : ''}
                  className="w-full cursor-pointer hover:border-blue-400 bg-white text-xs"
                  disabled={record.isStarted}
                />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 mb-0.5">产品 *</div>
                <Input 
                  placeholder="点击选择产品" 
                  readOnly 
                  onClick={() => {
                    if (record.isStarted) return;
                    openProductSelector(record.id);
                  }}
                  value={(record.dimensionValue || []).join(', ')}
                  className="w-full cursor-pointer hover:border-blue-400 bg-white text-xs"
                  disabled={record.isStarted}
                />
              </div>
            </div>
          );
        }
        return <Select placeholder="请先选择维度" disabled className="w-full" />;
      }
    },
    {
      title: '生效日期',
      key: 'effectiveDate',
      width: 150,
      render: (_, record) => (
        <DatePicker 
          className="w-full" 
          value={record.effectiveDate} 
          onChange={(val) => updateStrategy(record.id, 'effectiveDate', val)}
          placeholder="生效日期"
          disabled={record.isStarted}
        />
      )
    },
    {
      title: '失效日期',
      key: 'expiryDate',
      width: 150,
      render: (_, record) => (
        <DatePicker 
          className="w-full" 
          value={record.expiryDate} 
          onChange={(val) => updateStrategy(record.id, 'expiryDate', val)}
          placeholder="失效日期"
        />
      )
    },
    {
      title: '折扣率 (%)',
      key: 'discount',
      width: 140,
      render: (_, record) => (
        <div>
          <InputNumber 
            className="w-full" 
            min={0} 
            max={100} 
            precision={0}
            value={record.discountVal}
            onChange={(val) => updateStrategy(record.id, 'discountVal', val)}
          />
          <div className="text-[10px] text-gray-400 mt-1 leading-tight">
            录入 5 代表优惠 5%，折扣为 95 折
          </div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeStrategy(record.id)}
          disabled={record.isStarted}
        />
      )
    }
  ];

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      render: (text, record, index) => index + 1,
      width: 70,
    },
    {
      title: '策略编码',
      dataIndex: 'code',
      key: 'code',
      align: 'center',
    },
    {
      title: '策略维度',
      dataIndex: 'strategyDimension',
      key: 'strategyDimension',
      align: 'center',
      width: 140,
      render: (val, record) => {
        if (val) return val === '产品' ? '客户+产品' : val;
        if (record.customerCategory) return '客户类型';
        if (record.customerLevel) return '客户等级';
        if (record.customerRegion) return '客户区域';
        if (record.productInfo) return '客户+产品';
        return '-';
      }
    },
    {
      title: '维度值',
      dataIndex: 'dimensionValue',
      key: 'dimensionValue',
      align: 'left',
      render: (val, record) => {
        const isProduct = record.strategyDimension === '产品' || record.strategyDimension === '客户+产品' || record.productInfo;
        if (isProduct) {
          const custName = record.customerName || record.selectedCustomer?.name || '宜居美学';
          const custCode = record.customerCode || record.selectedCustomer?.code || 'CUS002';
          const prodInfo = record.productInfo || (Array.isArray(val) ? val.join(', ') : val) || '-';
          return (
            <div className="text-xs space-y-1 py-1">
              <div><span className="text-gray-400 font-medium">客户：</span><span className="text-gray-800">{custName}/{custCode}</span></div>
              <div><span className="text-gray-400 font-medium">产品：</span><span className="text-gray-800">{prodInfo}</span></div>
            </div>
          );
        }
        if (val) return val;
        return record.customerCategory || record.customerLevel || record.customerRegion || record.productInfo || '-';
      }
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      align: 'center',
    },
    {
      title: '失效日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      align: 'center',
    },
    {
      title: '状态',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const info = getStatusInfo(record.effectiveDate, record.expiryDate);
        return (
          <Tag color={info.color}>
            {info.text}
          </Tag>
        );
      },
    },
    {
      title: '启用/禁用',
      key: 'enabled',
      align: 'center',
      render: (_, record) => (
        <Switch 
          checked={record.enabled ?? true} 
          onChange={(checked) => {
            setData(prev => prev.map(item => item.id === record.id ? { ...item, enabled: checked } : item));
            message.success(checked ? '策略已启用' : '策略已禁用');
          }} 
        />
      ),
    },
    {
      title: '折扣率',
      dataIndex: 'discountRate',
      key: 'discountRate',
      align: 'center',
      render: (val) => `${Math.round((1 - val) * 100)}%`,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      align: 'center',
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      align: 'center',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const info = getStatusInfo(record.effectiveDate, record.expiryDate);
        if (info.text === '失效') return null;
        return (
          <Space size="middle">
            {info.text !== '生效' && (
              <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
            )}
            {info.text === '待生效' && (
              <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="bg-white min-h-full p-6">
      <div className="mb-6">
        <Title level={4} className="!m-0 text-gray-800">价格策略</Title>
      </div>

      <div className="bg-gray-50 p-6 rounded mb-6 border border-gray-100">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="text-xs text-gray-400 mb-1">客户类型</div>
            <Select 
              placeholder="请选择" 
              className="w-full" 
              allowClear 
              value={category}
              onChange={setCategory}
            >
              {categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="text-xs text-gray-400 mb-1">客户等级</div>
            <Select 
              placeholder="请选择" 
              className="w-full" 
              allowClear 
              value={level}
              onChange={setLevel}
            >
              {levels.map(l => <Select.Option key={l} value={l}>{l}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="text-xs text-gray-400 mb-1">客户区域</div>
            <Select 
              placeholder="请选择" 
              className="w-full" 
              allowClear 
              value={region}
              onChange={setRegion}
            >
              {regions.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={10} lg={6}>
            <div className="text-xs text-gray-400 mb-1">日期范围</div>
            <RangePicker 
              className="w-full" 
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} sm={24} md={12} lg={6} className="flex items-end h-full pt-5">
            <Space size="middle">
              <Button type="primary" className="bg-blue-600">查询</Button>
              <Button onClick={handleReset} className="bg-gray-400 text-white border-none hover:!bg-gray-500 hover:!text-white">重置</Button>
            </Space>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col span={24}>
            <Button 
              type="primary" 
              className="bg-green-600 border-none"
              onClick={() => {
                setStrategyList([{
                  id: Date.now() + Math.random(),
                  strategyDimension: '客户类型',
                  dimensionValue: [],
                  effectiveDate: null,
                  expiryDate: null,
                  discountVal: 0,
                  isStarted: false
                }]);
                setIsEditMode(false);
                setEditingId(null);
                setModalVisible(true);
              }}
            >
              新增策略
            </Button>
          </Col>
        </Row>
      </div>

      <div className="border border-gray-100 rounded">
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          size="middle"
          bordered
        />
      </div>

      <Modal
        title={<Title level={5} className="!m-0">{isEditMode ? '价格策略编辑' : '价格策略制定'}</Title>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)} className="bg-gray-100 hover:!bg-gray-200 border-none">
            取消
          </Button>,
          <Button key="save" type="primary" className="bg-blue-600 hover:!bg-blue-700" onClick={handleSave}>
            保存
          </Button>
        ]}
        styles={{ body: { padding: '24px' } }}
      >
        {!isEditMode && (
          <div className="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded border border-blue-50">
            <span className="text-gray-500 text-xs">
              <InfoCircleOutlined className="text-blue-500 mr-2" />
              每条策略代表一个报价优惠维度。请添加多条策略行并配置相应的策略维度与维度值。
            </span>
            <Button
              type="primary"
              className="bg-green-600 hover:!bg-green-700 font-medium border-none flex items-center gap-1"
              onClick={handleAddRow}
              icon={<PlusOutlined />}
            >
              添加策略行
            </Button>
          </div>
        )}

        <div className="border border-gray-100 rounded overflow-hidden">
          <Table 
            columns={modalColumns} 
            dataSource={strategyList} 
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            locale={{ emptyText: '暂无策略行，请点击右上角"添加策略行"按钮添加' }}
          />
        </div>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        title={<Title level={5} className="!m-0">选择产品</Title>}
        open={productModalVisible}
        onCancel={() => setProductModalVisible(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setProductModalVisible(false)}>
            取消
          </Button>,
          <Button key="ok" type="primary" className="bg-blue-600 hover:!bg-blue-700" onClick={() => {
            if (activeRowId) {
              const formattedProducts = tempSelectedProducts.map(p => `${p.code}/${p.name}`);
              updateStrategy(activeRowId, 'dimensionValue', formattedProducts);
            } else {
              setSelectedProducts(tempSelectedProducts);
            }
            setProductModalVisible(false);
            setActiveRowId(null);
          }}>
            确认
          </Button>
        ]}
        styles={{ body: { padding: '20px' } }}
      >
        {/* Search conditions: 产品编码、产品名称、产品类型 */}
        <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-100">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <div className="text-xs text-gray-500 mb-1">产品编码</div>
              <Input 
                placeholder="请输入产品编码" 
                value={productCodeQuery} 
                onChange={e => setProductCodeQuery(e.target.value)} 
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-xs text-gray-500 mb-1">产品名称</div>
              <Input 
                placeholder="请输入产品名称" 
                value={productNameQuery} 
                onChange={e => setProductNameQuery(e.target.value)} 
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-xs text-gray-500 mb-1">产品类型</div>
              <Select 
                placeholder="请选择产品类型" 
                className="w-full"
                value={productCategoryQuery}
                onChange={setProductCategoryQuery}
                allowClear
              >
                <Select.Option value="全部">全部</Select.Option>
                <Select.Option value="成品">成品</Select.Option>
                <Select.Option value="原材料">原材料</Select.Option>
              </Select>
            </Col>
            <Col span={24} className="flex justify-end">
              <Space>
                <Button 
                  onClick={() => {
                    setProductCodeQuery('');
                    setProductNameQuery('');
                    setProductCategoryQuery('全部');
                  }}
                  className="bg-gray-100 hover:!bg-gray-200 border-none"
                >
                  重置
                </Button>
                <Button 
                  type="primary" 
                  className="bg-blue-600 hover:!bg-blue-700"
                  onClick={() => {
                    message.success('查询成功');
                  }}
                >
                  查询
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Product Table List */}
        <div className="border border-gray-100 rounded overflow-hidden">
          <Table
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: tempSelectedRowKeys,
              onChange: (selectedKeys, selectedRows) => {
                setTempSelectedRowKeys(selectedKeys);
                const itemsSelected = (allProducts || []).filter(item => selectedKeys.includes(item.id));
                setTempSelectedProducts(itemsSelected);
              }
            }}
            columns={[
              {
                title: '序号',
                key: 'idx',
                width: 60,
                align: 'center',
                render: (_, __, index) => index + 1
              },
              {
                title: '产品编码',
                dataIndex: 'code',
                key: 'code',
                align: 'center'
              },
              {
                title: '产品名称',
                dataIndex: 'name',
                key: 'name',
                align: 'center'
              },
              {
                title: '规格',
                dataIndex: 'spec',
                key: 'spec',
                align: 'center'
              },
              {
                title: '型号',
                key: 'model',
                align: 'center',
                render: (_, record) => record.model || record.spec || '常规款式'
              },
              {
                title: '产品类型',
                dataIndex: 'category',
                key: 'category',
                align: 'center',
                render: (val) => val && val !== '-' ? val : '原材料'
              }
            ]}
            dataSource={(allProducts || []).filter(item => {
              if (productCodeQuery && !item.code.toLowerCase().includes(productCodeQuery.toLowerCase())) return false;
              if (productNameQuery && !item.name.toLowerCase().includes(productNameQuery.toLowerCase())) return false;
              if (productCategoryQuery && productCategoryQuery !== '全部') {
                const itemCat = item.category || '原材料';
                if (itemCat !== productCategoryQuery) return false;
              }
              return true;
            })}
            rowKey="id"
            pagination={{
              defaultPageSize: 5,
              pageSizeOptions: ['5', '10', '15', '20'],
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`
            }}
            size="small"
            bordered
          />
        </div>
      </Modal>

      {/* 客户选择弹窗 */}
      <Modal
        title={<div className="font-semibold text-gray-800 text-base">选择客户</div>}
        open={customerModalVisible}
        onCancel={() => {
          setCustomerModalVisible(false);
          setActiveRowId(null);
        }}
        width={850}
        footer={[
          <Button key="cancel" onClick={() => {
            setCustomerModalVisible(false);
            setActiveRowId(null);
          }}>
            取消
          </Button>,
          <Button key="ok" type="primary" className="bg-blue-600 hover:!bg-blue-700" onClick={() => {
            if (activeRowId && tempSelectedCustomer) {
              updateStrategy(activeRowId, {
                selectedCustomer: tempSelectedCustomer
              });
            }
            setCustomerModalVisible(false);
            setActiveRowId(null);
          }}>
            确认
          </Button>
        ]}
        styles={{ body: { padding: '20px' } }}
      >
        <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-100">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={10}>
              <div className="text-xs text-gray-500 mb-1 font-medium">客户名称</div>
              <Input 
                placeholder="请输入客户名称" 
                value={customerNameQuery} 
                onChange={e => setCustomerNameQuery(e.target.value)} 
                allowClear
              />
            </Col>
            <Col xs={24} sm={10}>
              <div className="text-xs text-gray-500 mb-1 font-medium">客户编码</div>
              <Input 
                placeholder="请输入客户编码" 
                value={customerCodeQuery} 
                onChange={e => setCustomerCodeQuery(e.target.value)} 
                allowClear
              />
            </Col>
            <Col xs={24} sm={4} className="flex items-end justify-end pt-5">
              <Space>
                <Button 
                  onClick={() => {
                    setCustomerNameQuery('');
                    setCustomerCodeQuery('');
                  }}
                  className="bg-white border-gray-300 hover:text-blue-600"
                >
                  重置
                </Button>
                <Button 
                  type="primary" 
                  className="bg-blue-600 hover:!bg-blue-700 border-none"
                  onClick={() => {
                    message.success('查询成功');
                  }}
                >
                  查询
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <div className="border border-gray-100 rounded overflow-hidden">
          <Table
            rowSelection={{
              type: 'radio',
              selectedRowKeys: tempSelectedCustomerKey ? [tempSelectedCustomerKey] : [],
              onChange: (selectedKeys, selectedRows) => {
                if (selectedRows && selectedRows.length > 0) {
                  setTempSelectedCustomerKey(selectedKeys[0]);
                  setTempSelectedCustomer(selectedRows[0]);
                }
              }
            }}
            columns={[
              {
                title: '序号',
                key: 'idx',
                width: 60,
                align: 'center',
                render: (_, __, index) => index + 1
              },
              {
                title: '客户编码',
                dataIndex: 'code',
                key: 'code',
                align: 'center'
              },
              {
                title: '客户名称',
                dataIndex: 'name',
                key: 'name',
                align: 'center'
              },
              {
                title: '客户类型',
                dataIndex: 'type',
                key: 'type',
                align: 'center'
              },
              {
                title: '客户等级',
                dataIndex: 'level',
                key: 'level',
                align: 'center'
              },
              {
                title: '客户区域',
                dataIndex: 'region',
                key: 'region',
                align: 'center'
              }
            ]}
            dataSource={(allCustomers || []).filter(item => {
              if (customerNameQuery && !item.name.toLowerCase().includes(customerNameQuery.toLowerCase())) return false;
              if (customerCodeQuery && !item.code.toLowerCase().includes(customerCodeQuery.toLowerCase())) return false;
              return true;
            })}
            rowKey="id"
            pagination={{
              defaultPageSize: 5,
              pageSizeOptions: ['5', '10', '15', '20'],
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`
            }}
            size="small"
            bordered
          />
        </div>
      </Modal>
      
      <style>{`
        .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          color: #374151 !important;
          font-weight: 600 !important;
        }
        .ant-btn-primary.bg-blue-600:hover, 
        .ant-btn-primary.bg-blue-600:focus,
        .ant-btn-primary.bg-blue-600:active {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
        .ant-btn-primary.bg-green-600:hover,
        .ant-btn-primary.bg-green-600:focus,
        .ant-btn-primary.bg-green-600:active {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
          color: white !important;
        }
        .ant-select-multiple .ant-select-selection-item {
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          color: #0369a1;
        }
      `}</style>
    </div>
  );
};

export default PriceStrategyLedger;
