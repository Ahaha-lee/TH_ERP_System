const fs = require('fs');
const files = [
  "src/components/sales/afterSales/ReplenishOrderFormModal.jsx",
  "src/components/sales/afterSales/ExchangeOrderFormModal.jsx",
  "src/components/sales/afterSales/ReturnOrderFormModal.jsx",
  "src/components/sales/ReturnFormModal.jsx",
  "src/components/sales/ReplenishFormModal.jsx",
  "src/components/sales/trustee/TrusteeOrderFormModal.jsx",
  "src/components/sales/AfterSaleReplenishFormModal.jsx",
  "src/components/sales/NormalOrderFormModal.jsx",
  "src/components/sales/ConsignmentFormModal.jsx",
  "src/components/sales/ExchangeFormModal.jsx",
  "src/components/sales/DeliveryNoticeFormModal.jsx",
  "src/components/sales/AfterSaleReturnFormModal.jsx",
  "src/components/sales/AfterSaleExchangeFormModal.jsx",
  "src/components/inbound/ReturnInboundFormModal.jsx",
  "src/components/inbound/ConsignmentInboundFormModal.jsx",
  "src/components/inbound/SubcontractInboundFormModal.jsx",
  "src/components/inbound/ProductionInboundFormModal.jsx",
  "src/components/inbound/PurchaseInboundFormModal.jsx",
  "src/components/outbound/PickOutboundFormModal.jsx",
  "src/components/outbound/OtherOutboundFormModal.jsx",
  "src/components/outbound/SubcontractOutboundFormModal.jsx",
  "src/components/outbound/SalesOutboundFormModal.jsx",
  "src/components/quotation/QuotationFormModal.jsx",
  "src/components/inventory/StocktakingFormModal.jsx",
  "src/components/warehouse/WarehouseFormModal.jsx",
  "src/components/label/LabelRuleFormModal.jsx"
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, "utf8");
  const orig = content;
  content = content.replace(/\}\-预览`,/g, "} else { form.setFieldsValue({ orderNo: `ORDER-预览`,");
  content = content.replace(/\}\-预览`;/g, "} else { form.setFieldsValue({ orderNo: `ORDER-预览` });");
  content = content.replace(/\}\-\$\{Math\.floor/g, "} else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor");
  content = content.replace(/\}\$\{Math\.floor/g, "} else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor");
  
  if (orig !== content) {
    fs.writeFileSync(f, content);
    console.log("Fixed", f);
  }
}
