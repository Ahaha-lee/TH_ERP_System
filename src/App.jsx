import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, theme, App as AntdApp } from 'antd';
import { 
  UserOutlined, 
  AccountBookOutlined, 
  PercentageOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  InteractionOutlined,
  ToolOutlined,
  ImportOutlined,
  ExportOutlined,
  DatabaseOutlined,
  TagsOutlined
} from '@ant-design/icons';
import CustomerManagement from './pages/CustomerManagement';
import PriceStrategy from './pages/PriceStrategy';
import RechargeLedger from './pages/RechargeLedger';
import QuotationList from './pages/sales/QuotationList';
import NormalOrderList from './pages/sales/NormalOrderList';
import AfterSaleOrder from './pages/sales/AfterSaleOrder';
import ConsignmentOrderList from './pages/sales/ConsignmentOrderList';
import DeliveryNotice from './pages/sales/DeliveryNotice';
import EstimationOrder from './pages/sales/EstimationOrder';
import SizePricingRule from './pages/settings/SizePricingRule';
import InboundOrderList from './pages/inbound/InboundOrderList';
import BatchManagement from './pages/inbound/BatchManagement';
import OutboundOrderList from './pages/outbound/OutboundOrderList';
import StocktakingList from './pages/inventory/StocktakingList';
import LabelRule from './pages/settings/LabelRule';
import MaterialStockLedger from './pages/inventory/MaterialStockLedger';
import WarehouseList from './pages/warehouse/WarehouseList';

import ReceiptManagement from './pages/finance/ReceiptManagement';
import ClaimRecordLedger from './pages/finance/ClaimRecordLedger';
import ErrorBoundary from './ErrorBoundary';

const { Header, Content, Sider } = Layout;

const AppContent = () => {
  const location = useLocation();
  const selectedKey = location.pathname.startsWith('/customers') ? 'customers' : 
                     location.pathname.startsWith('/price-strategy') ? 'price-strategy' : 
                     location.pathname.startsWith('/quotations') ? 'quotations' :
                     location.pathname.startsWith('/recharge-ledger') ? 'recharge-ledger' :
                     location.pathname.startsWith('/sales-orders/normal') ? 'normal-order' :
                     location.pathname.startsWith('/sales/after-sale') ? 'after-sale' :
                     location.pathname.startsWith('/sales/consignment') ? 'consignment' :
                     location.pathname.startsWith('/estimation') ? 'estimation' :
                     location.pathname.startsWith('/size-pricing-rule') ? 'size-pricing-rule' :
                     location.pathname.startsWith('/inbound') ? 'inbound' :
                     location.pathname.startsWith('/outbound') ? 'outbound' :
                     location.pathname.startsWith('/batch-management') ? 'batch-management' :
                     location.pathname.startsWith('/stocktaking') ? 'stocktaking' :
                     location.pathname.startsWith('/material-stock-ledger') ? 'material-stock-ledger' :
                     location.pathname.startsWith('/label-rule') ? 'label-rule' :
                     location.pathname.startsWith('/warehouses') ? 'warehouses' :
                     location.pathname.startsWith('/delivery-notice') ? 'delivery-notice' :
                     location.pathname.startsWith('/receipt-management') ? 'receipt-management' :
                     location.pathname.startsWith('/claim-record-ledger') ? 'claim-record-ledger' : 'customers';

  return (
    <Layout className="min-h-screen">
      <Sider
        width={200}
        theme="light"
        className="border-r border-gray-200 overflow-auto"
        style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        <div className="h-12 flex items-center justify-center border-b border-gray-100 mb-2">
          <div className="text-lg font-bold text-blue-600">ERP System</div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['sales-mgmt', 'inventory-mgmt']}
          className="border-none"
          items={[
            {
              key: 'basic-mgmt',
              icon: <DatabaseOutlined />,
              label: '基础资料',
              children: [
                {
                  key: 'warehouses',
                  icon: <DatabaseOutlined />,
                  label: <Link to="/warehouses">仓库与货位管理</Link>,
                },
              ]
            },
            {
              key: 'sales-mgmt',
              icon: <ShoppingCartOutlined />,
              label: '销售管理',
              children: [
                {
                  key: 'customers',
                  icon: <UserOutlined />,
                  label: <Link to="/customers">客户管理</Link>,
                },
                {
                  key: 'price-strategy',
                  icon: <PercentageOutlined />,
                  label: <Link to="/price-strategy">价格策略</Link>,
                },
                {
                  key: 'quotations',
                  icon: <FileTextOutlined />,
                  label: <Link to="/quotations">报价管理</Link>,
                },
                {
                  key: 'estimation',
                  icon: <InteractionOutlined />,
                  label: <Link to="/estimation">报价预估</Link>,
                },
                {
                  key: 'size-pricing-rule',
                  icon: <ToolOutlined />,
                  label: <Link to="/size-pricing-rule">阶梯式计价规则</Link>,
                },
                {
                  key: 'delivery-notice',
                  icon: <FileTextOutlined />,
                  label: <Link to="/delivery-notice">发货通知单</Link>,
                },
                {
                  key: 'normal-order',
                  icon: <ShoppingCartOutlined />,
                  label: <Link to="/sales-orders/normal">普通销售订单</Link>,
                },
                {
                  key: 'after-sale',
                  icon: <InteractionOutlined />,
                  label: <Link to="/sales/after-sale">售后销售订单</Link>,
                },
                {
                  key: 'consignment',
                  icon: <ToolOutlined />,
                  label: <Link to="/sales/consignment">受托加工销售订单</Link>,
                },
                {
                  key: 'recharge-ledger',
                  icon: <AccountBookOutlined />,
                  label: <Link to="/recharge-ledger">充值订单台账</Link>,
                },
              ]
            },
            {
              key: 'inventory-mgmt',
              icon: <DatabaseOutlined />,
              label: '库存管理',
              children: [
                {
                  key: 'inbound',
                  icon: <ImportOutlined />,
                  label: <Link to="/inbound">入库管理</Link>,
                },
                {
                  key: 'outbound',
                  icon: <ExportOutlined />,
                  label: <Link to="/outbound">出库管理</Link>,
                },
                {
                  key: 'batch-management',
                  icon: <DatabaseOutlined />,
                  label: <Link to="/batch-management">批次管理</Link>,
                },
                {
                  key: 'material-stock-ledger',
                  icon: <DatabaseOutlined />,
                  label: <Link to="/material-stock-ledger">物料库存台账</Link>,
                },
                {
                  key: 'stocktaking',
                  icon: <InteractionOutlined />,
                  label: <Link to="/stocktaking">盘点管理</Link>,
                },
              ]
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header className="bg-white px-6 h-12 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10 w-full">
          <div className="text-gray-500 font-medium whitespace-nowrap">
            {selectedKey === 'customers' ? '客户管理' : 
             selectedKey === 'price-strategy' ? '价格策略管理' : 
             selectedKey === 'quotations' ? '报价管理' : 
             selectedKey === 'recharge-ledger' ? '充值订单台账' :
             selectedKey === 'normal-order' ? '普通销售订单' :
             selectedKey === 'after-sale' ? '售后销售订单' :
             selectedKey === 'consignment' ? '受托加工销售订单' :
             selectedKey === 'estimation' ? '报价预估' :
             selectedKey === 'size-pricing-rule' ? '阶梯式计价规则' :
             selectedKey === 'inbound' ? '入库管理' :
             selectedKey === 'outbound' ? '出库管理' :
             selectedKey === 'batch-management' ? '批次管理' :
             selectedKey === 'stocktaking' ? '盘点管理' :
             selectedKey === 'material-stock-ledger' ? '物料库存台账' :
             selectedKey === 'warehouses' ? '仓库与货位管理' :
             selectedKey === 'receipt-management' ? '收款管理' :
             selectedKey === 'claim-record-ledger' ? '认领记录台账' :
             selectedKey === 'delivery-notice' ? '发货通知单' : '客户管理'}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <span className="mr-4 text-gray-400">当前用户:</span>
            <UserOutlined className="mr-1" />
            管理员
          </div>
        </Header>
        <Content className="p-4 bg-gray-50 overflow-initial">
          <ErrorBoundary>
            <Routes>
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/price-strategy" element={<PriceStrategy />} />
              <Route path="/quotations" element={<QuotationList />} />
              <Route path="/recharge-ledger" element={<RechargeLedger />} />
              <Route path="/sales-orders/normal" element={<NormalOrderList />} />
              <Route path="/sales/after-sale" element={<AfterSaleOrder />} />
              <Route path="/sales/consignment" element={<ConsignmentOrderList />} />
              <Route path="/estimation" element={<EstimationOrder />} />
              <Route path="/size-pricing-rule" element={<SizePricingRule />} />
              <Route path="/inbound" element={<InboundOrderList />} />
              <Route path="/outbound" element={<OutboundOrderList />} />
              <Route path="/batch-management" element={<BatchManagement />} />
              <Route path="/stocktaking" element={<StocktakingList />} />
              <Route path="/material-stock-ledger" element={<MaterialStockLedger />} />
              <Route path="/label-rule" element={<LabelRule />} />
              <Route path="/warehouses" element={<WarehouseList />} />
              <Route path="/delivery-notice" element={<DeliveryNotice />} />
              <Route path="/receipt-management" element={<ReceiptManagement />} />
              <Route path="/claim-record-ledger" element={<ClaimRecordLedger />} />
              <Route path="/" element={<Navigate to="/sales-orders/normal" replace />} />
            </Routes>
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.compactAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 4,
        },
      }}
    >
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
}
