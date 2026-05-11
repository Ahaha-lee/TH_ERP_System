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
  let text = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Pattern 1: }-预览`,
  text = text.replace(/\}(\-预览|预览)`\s*,/g, () => {
    changed = true;
    return "} else { form.setFieldsValue({ orderNo: `ORDER-预览`,";
  });
  
  // Pattern 1b: }-预览`;
  text = text.replace(/\}(\-预览|预览)`\s*;/g, () => {
    changed = true;
    return "} else { form.setFieldsValue({ orderNo: `ORDER-预览` });";
  });

  // Pattern 2: }-${Math.floor...
  text = text.replace(/\}-\$\{Math\.floor\(/g, () => {
    changed = true;
    return "} else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor(";
  });

  // Pattern 3: }${Math.floor...
  text = text.replace(/\}\$\{Math\.floor\(/g, () => {
    changed = true;
    return "} else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor(";
  });
  
  // Custom for DeliveryNoticeFormModal:
  text = text.replace(/\}-\$\{Math\.floor\(Math\.random\(\) \* 9000 \+ 1000\)\}`\); \s*form\.setFieldValue\('createdAt',/g, () => {
    changed = true;
    return "} else { form.setFieldsValue({ deliveryNo: `FH-${Math.floor(Math.random() * 9000 + 1000)}` }); form.setFieldValue('createdAt',";
  });

  if (changed) {
    fs.writeFileSync(f, text);
    console.log("Fixed syntax in", f);
  }
}
