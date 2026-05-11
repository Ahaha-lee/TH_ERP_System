import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Space, 
  Tag, 
  Typography, 
  message,
  Modal
} from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { customerCategories as initialCategories, priceVersions as initialPriceVersions } from '../mock';
import PriceVersionModal from '../components/PriceVersionModal';
import AddCategoryModal from '../components/AddCategoryModal';
import AuditDetailDrawer from '../components/AuditDetailDrawer';

const { Text, Title } = Typography;

const PriceStrategy = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [versions, setVersions] = useState(initialPriceVersions);
  const [selectedCategoryId, setSelectedCategoryId] = useState('cat1');
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [auditVisible, setAuditVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const currentVersions = versions.filter(v => v.categoryId === selectedCategoryId)
    .sort((a, b) => dayjs(b.startDate).unix() - dayjs(a.startDate).unix());

  const latestVersion = currentVersions.find(v => v.status === '生效');

  const handleDeleteVersion = (id) => {
    Modal.confirm({
      title: '确认删除？',
      content: '删除后无法恢复',
      onOk: () => {
        setVersions(versions.filter(v => v.id !== id));
        message.success('删除成功');
      }
    });
  };

  const versionColumns = [
    { title: '折扣率(%)', dataIndex: 'discountRate', render: (val) => `${val}%` },
    { title: '生效日期', dataIndex: 'startDate' },
    { title: '失效日期', dataIndex: 'endDate', render: (val) => val || '至今' },
    { 
      title: '状态', 
      dataIndex: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === '生效') color = 'green';
        if (status === '已失效') color = 'default';
        if (status === '待审批') color = 'orange';
        if (status === '审批拒绝') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { title: '变更原因', dataIndex: 'reason', ellipsis: true },
  ];

  return (
    <div className="flex gap-4 h-full">
      {/* Left Sidebar */}
      <div className="w-[280px] space-y-2 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <Title level={5} className="!mb-0">客户分类</Title>
        </div>
        {categories.map(category => {
          const catVersion = versions.filter(v => v.categoryId === category.id && v.status === '生效')[0];
          return (
            <Card
              key={category.id}
              size="small"
              className={`cursor-pointer transition-all ${selectedCategoryId === category.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'hover:border-blue-300'}`}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <div className="flex justify-between items-start">
                <Text strong>{category.name}</Text>
                {category.enabled ? <Tag color="green" size="small">启用</Tag> : <Tag color="default">禁用</Tag>}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <div>当前折扣率: <Text type="danger">{catVersion?.discountRate || 0.0}%</Text></div>
                <div>生效日期: {catVersion?.startDate || '-'}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Right Content */}
      <div className="flex-1">
        <Card title={selectedCategory ? `${selectedCategory.name} - 折扣率版本历史` : '版本历史'} size="small">
          <div className="flex justify-end mb-4">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              disabled={!selectedCategory}
              onClick={() => setVersionModalVisible(true)}
            >
              新增版本
            </Button>
          </div>
          <Table 
            columns={versionColumns} 
            dataSource={currentVersions} 
            rowKey={(record) => record?.id || record?.key}
            size="small" 
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      <PriceVersionModal
        open={versionModalVisible}
        category={selectedCategory}
        onClose={() => setVersionModalVisible(false)}
        onSuccess={(newVersion) => {
          // Auto-expire previous version
          const updatedVersions = versions.map(v => {
            if (v.categoryId === newVersion.categoryId && v.status === '生效') {
              return { ...v, status: '已失效', endDate: dayjs(newVersion.startDate).subtract(1, 'day').format('YYYY-MM-DD') };
            }
            return v;
          });
          setVersions([newVersion, ...updatedVersions]);
          setVersionModalVisible(false);
          message.success('新增版本成功，已自动生效');
        }}
      />

      <AddCategoryModal
        open={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSuccess={(newCategory) => {
          setCategories([...categories, newCategory]);
          setCategoryModalVisible(false);
          message.success('新增分类成功');
        }}
      />

      <AuditDetailDrawer
        open={auditVisible}
        target={selectedVersion ? { code: `版本-${selectedVersion.discountRate}%` } : null}
        onClose={() => setAuditVisible(false)}
      />
    </div>
  );
};

export default PriceStrategy;
