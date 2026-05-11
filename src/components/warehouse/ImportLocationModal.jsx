
import React, { useState } from 'react';
import { Modal, Upload, Button, message, Space, Typography } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Text, Link } = Typography;

const ImportLocationModal = ({ open, onCancel, onImport, existingNames = [] }) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImport = () => {
    if (fileList.length === 0) {
      message.warning('请先上传文件');
      return;
    }

    setLoading(true);
    // Simulated parsing logic
    setTimeout(() => {
      // Mock imported data from a "file"
      const mockImportedData = [
        { name: 'B区-01-01', type: '常规', spec: '1.5x1.5m' },
        { name: 'B区-01-02', type: '常规', spec: '1.5x1.5m' },
        { name: '待检区-01', type: '待检', spec: '3x3m' },
      ];

      // Validation
      for (let i = 0; i < mockImportedData.length; i++) {
        const item = mockImportedData[i];
        if (existingNames.some(name => name.toLowerCase() === item.name.toLowerCase())) {
          message.error(`第${i + 1}行货位名称【${item.name}】已存在，请修改后重新导入`);
          setLoading(false);
          return;
        }
      }

      onImport(mockImportedData);
      message.success('导入成功');
      setLoading(false);
      onCancel();
      setFileList([]);
    }, 1000);
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.csv');
      if (!isExcel) {
        message.error('只能上传 .xlsx 或 .csv 文件');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <Modal forceRender
      title="导入货位"
      open={open}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleImport}>确认导入</Button>
      ]}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <div className="bg-blue-50 p-3 rounded">
          <Space>
            <Text>请先下载模板填写数据：</Text>
            <Button type="link" icon={<DownloadOutlined />} size="small">
              下载导入模板.xlsx
            </Button>
          </Space>
        </div>

        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或将文件拖拽到此区域上传</p>
          <p className="ant-upload-hint">
            支持 .xlsx, .csv 格式，单文件上传
          </p>
        </Dragger>

        <ul className="text-gray-500 text-sm list-disc pl-5">
          <li>导入仅追加，不覆盖已有货位数据</li>
          <li>系统将自动检查名称是否重复（忽略大小写）</li>
          <li>类型必填且需符合：常规、暂存、待检、退货区</li>
        </ul>
      </Space>
    </Modal>
  );
};

export default ImportLocationModal;
