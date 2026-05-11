import React, { useState } from 'react';
import { Modal, Upload, Button, Typography, Space, message } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title, Link } = Typography;
const { Dragger } = Upload;

const ImportFlowModal = ({ open, onCancel, onImport }) => {
  const [fileList, setFileList] = useState([]);

  const handleImport = () => {
    if (fileList.length === 0) {
      return message.warning('请先上传流水文件');
    }
    message.loading({ content: '正在解析流水文件...', key: 'importing' });
    
    // Simulate generation of unique batch number
    const batchNo = `PC-${dayjs().format('YYYYMMDD')}-0001`;

    // Simulate mock data creation based on parsed file
    const mockMinedFlows = [
      {
        id: `m1-${Date.now()}`,
        flowNo: `ICBC${dayjs().format('YYYYMMDD')}9991`,
        transTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        amount: 8800,
        batchNo: batchNo,
        payerName: '全友家居',
        payerAccount: '6222********8888',
        summary: '支付宝转入',
        claimStatus: '未认领',
        claimUser: null,
        claims: []
      },
      {
        id: `m2-${Date.now()}`,
        flowNo: `ICBC${dayjs().format('YYYYMMDD')}9992`,
        transTime: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        amount: 15000,
        batchNo: batchNo,
        payerName: '创意空间有限公司',
        payerAccount: '6222********7777',
        summary: '转账',
        claimStatus: '未认领',
        claimUser: null,
        claims: []
      }
    ];

    setTimeout(() => {
      message.success({ content: `导入成功 2 条流水，跳过重复 0 条。批次号：${batchNo}`, key: 'importing', duration: 3 });
      onImport(mockMinedFlows);
      setFileList([]);
      onCancel();
    }, 1500);
  };

  return (
    <Modal forceRender
      title="导入银行流水"
      open={open}
      onCancel={() => {
        setFileList([]);
        onCancel();
      }}
      width={900}
      centered
      onOk={handleImport}
      okText="确认导入"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-md flex justify-between items-center">
          <div>
            <Title level={5} className="!mb-1">导入说明</Title>
            <Text type="secondary">请下载最新模板，确保字段对应。系统将根据流水号自动去重。</Text>
          </div>
          <Link onClick={() => message.info('开始下载导入模板...')}>
            <DownloadOutlined /> 下载导入模板.xlsx
          </Link>
        </div>

        <Dragger
          name="file"
          multiple={false}
          accept=".xlsx,.csv"
          fileList={fileList}
          onChange={(info) => {
            setFileList(info.fileList.slice(-1));
          }}
          beforeUpload={() => false}
        >
          <p className="ant-upload-drag-icon">
            <FileExcelOutlined />
          </p>
          <p className="ant-upload-text">点击或将流水文件（.xlsx / .csv）拖拽到此区域</p>
          <p className="ant-upload-hint">支持单文件上传。严禁上传非银行流水格式文件。</p>
        </Dragger>
      </div>
    </Modal>
  );
};

export default ImportFlowModal;
