import React, { useState } from 'react';
import { Modal, Upload, Button, Typography, Space, message, Alert } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { importFromExcel } from '../../utils/excelUtils';

const { Dragger } = Upload;
const { Text, Link } = Typography;

const ImportResultModal = ({ open, onCancel, onConfirm, task }) => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    setLoading(true);
    setErrorList([]);
    try {
      const data = await importFromExcel(fileList[0].originFileObj);
      
      // Basic validation
      if (data.length === 0) throw new Error('Excel 文件为空');
      
      const firstRow = data[0];
      const requiredColumns = ['货位编码', '物料编码', '实盘数量'];
      const missingColumns = requiredColumns.filter(c => !(c in firstRow));
      if (missingColumns.length > 0) {
        throw new Error(`表头列名校验失败，缺失列：${missingColumns.join('、')}`);
      }

      const errors = [];
      const validData = [];
      
      const snapshotMap = new Map((task?.baseSnapshot || []).map(s => 
        [`${s.location}_${s.productCode}`, s]
      ));

      data.forEach((row, index) => {
        const rowNum = index + 2; // +1 for 0-index, +1 for header
        const actualQtyRaw = row['实盘数量'];
        const location = row['货位编码'];
        const productCode = row['物料编码'];
        const batchNo = row['批次号']; // Optional?
        
        let valid = true;

        // Number format validation
        const qtyNum = Number(actualQtyRaw);
        if (actualQtyRaw === undefined || actualQtyRaw === null || actualQtyRaw === '' || isNaN(qtyNum)) {
          errors.push(`第 ${rowNum} 行：“实盘数量”格式错误 (${actualQtyRaw})`);
          valid = false;
        } else if (qtyNum < 0) {
          errors.push(`第 ${rowNum} 行：“实盘数量”不能为负数 (${actualQtyRaw})`);
          valid = false;
        }

        // Range check matches baseSnapshot (simulating range check)
        const key = `${location}_${productCode}`;
        if (!snapshotMap.has(key)) {
           // Warning or error? Prompt says "物料编码、批次号、货位编码范围校验。"
           errors.push(`第 ${rowNum} 行：货位 (${location}) 与物料 (${productCode}) 不在盘点范围内`);
           valid = false;
        }

        if (valid) {
          validData.push(row);
        }
      });

      if (errors.length > 0) {
        setErrorList(errors);
        message.error('数据校验不通过，请检查错误列表');
        return; // Stop processing
      }
      
      onConfirm(data);
      setFileList([]);
    } catch (error) {
      message.error(`导入失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const props = {
    onRemove: () => { setFileList([]); setErrorList([]); },
    beforeUpload: (file) => {
      setFileList([file]);
      setErrorList([]);
      return false;
    },
    fileList,
    maxCount: 1,
    accept: '.xlsx,.xls'
  };

  return (
    <Modal forceRender
      title="导入盘点结果"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleUpload}>确认导入</Button>
      ]}
      width={600}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          title="导入须知"
          description="导入文件必须包含：货位编码、物料编码、实盘数量。系统将根据货位+编码匹配数据。"
          type="info"
          showIcon
        />
        
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">仅支持 .xlsx 或 .xls 格式</p>
        </Dragger>

        <div style={{ textAlign: 'right' }}>
          <Link href="#" onClick={(e) => { e.preventDefault(); message.info('正在下载模板...'); }}>
            <DownloadOutlined /> 下载盘点结果导入模板
          </Link>
        </div>

        {errorList.length > 0 && (
          <Alert
            type="error"
            title="数据校验错误"
            description={
              <ul style={{ paddingLeft: 20, margin: 0, maxHeight: 150, overflowY: 'auto' }}>
                {errorList.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            }
          />
        )}
      </Space>
    </Modal>
  );
};

export default ImportResultModal;
