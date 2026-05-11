const fs = require('fs');

const files = [
'src/components/estimation/EstimationFormModal.jsx',
'src/components/inbound/ConsignmentInboundFormModal.jsx',
'src/components/inbound/ProductionInboundFormModal.jsx',
'src/components/inbound/PurchaseInboundFormModal.jsx',
'src/components/inbound/ReturnInboundFormModal.jsx',
'src/components/inbound/SubcontractInboundFormModal.jsx',
'src/components/label/LabelRuleFormModal.jsx',
'src/components/outbound/OtherOutboundFormModal.jsx',
'src/components/outbound/PickOutboundFormModal.jsx',
'src/components/outbound/SalesOutboundFormModal.jsx',
'src/components/outbound/SubcontractOutboundFormModal.jsx',
'src/components/quotation/CustomerSelectModal.jsx',
'src/components/quotation/PropertySelectModal.jsx',
'src/components/quotation/QuotationFormModal.jsx',
'src/components/sales/AfterSaleExchangeFormModal.jsx',
'src/components/sales/AfterSaleReplenishFormModal.jsx',
'src/components/sales/AuditActionModal.jsx',
'src/components/sales/ConsignmentFormModal.jsx',
'src/components/sales/CustomerSelectModal.jsx',
'src/components/sales/ExchangeFormModal.jsx',
'src/components/sales/OrderSourceSelectModal.jsx',
'src/components/sales/QuotationSelectModal.jsx',
'src/components/sales/ReplenishFormModal.jsx',
'src/components/sales/ReturnFormModal.jsx',
'src/components/sales/SalesOrderSelectModal.jsx',
'src/components/settings/SizeRuleFormModal.jsx',
'src/components/warehouse/WarehouseFormModal.jsx',
'src/components/inventory/StocktakingFormModal.jsx',
'src/components/PriceVersionModal.jsx',
'src/components/CustomerEditModal.jsx',
'src/components/sales/AfterSaleReturnFormModal.jsx',
'src/components/sales/DeliveryNoticeFormModal.jsx',
'src/components/sales/NormalOrderFormModal.jsx',
'src/components/sales/FinanceAuditModal.jsx',
'src/components/sales/AfterSaleExchangeFormModal.jsx',
'src/components/sales/AfterSaleReplenishFormModal.jsx',
'src/components/inbound/modals/PurchaseOrderSelectModal.jsx',
'src/components/inbound/modals/WorkOrderSelectModal.jsx',
'src/components/inbound/modals/AfterSaleOrderSelectModal.jsx',
'src/components/inbound/modals/ConsignmentOrderSelectModal.jsx',
'src/components/outbound/modals/ApplyOrderSelectModal.jsx',
'src/components/outbound/modals/DeliveryNoticeSelectModal.jsx',
'src/components/outbound/modals/BatchSelectModal.jsx',
'src/components/outbound/modals/OutboundAuditModal.jsx',
'src/components/outbound/modals/PickApplySelectModal.jsx',
'src/components/outbound/modals/SubcontractPurchaseSelectModal.jsx',
'src/components/ReturnFormModal.jsx',
'src/components/ReplenishFormModal.jsx',
'src/components/ExchangeFormModal.jsx',
'src/components/QuotationFormModal.jsx',
'src/components/CustomerSelectModal.jsx',
'src/components/sales/trustee/TrusteeOrderFormModal.jsx',
'src/components/sales/afterSales/ReplenishOrderFormModal.jsx',
'src/components/sales/afterSales/ExchangeOrderFormModal.jsx',
'src/components/sales/afterSales/ReturnOrderFormModal.jsx',
'src/components/sales/AuditModal.jsx',
'src/components/sales/WarehouseAuditModal.jsx',
'src/pages/CustomerManagement.jsx',
'src/pages/QuotationManagement.jsx',
'src/pages/RechargeLedger.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<Modal(?=\s|>)/g, '<Modal forceRender');
    content = content.replace(/<Drawer(?=\s|>)/g, '<Drawer forceRender');
    content = content.replace(/forceRender\s+forceRender/g, 'forceRender');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
