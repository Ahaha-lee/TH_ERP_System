/**
 * Centralized Reactive Data Store for ERP System
 */
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

const initialState = {
  employees: [
    { id: 'emp1', name: '管理员', status: '在职', role: 'admin' },
    { id: 'emp2', name: '张经理', status: '在职', role: 'sales' },
    { id: 'emp3', name: '李仓库员', status: '在职', role: 'warehouse' },
    { id: 'emp4', name: '财务王', status: '在职', role: 'finance' }
  ],
  customers: [
    { id: 'cus1', code: 'CUS001', name: '美家家居', type: '经销商', contact: '张总', phone: '13811112222', status: '启用', salesperson: '张经理', settlementMethod: '月结', approvalStatus: '审批通过', feedbacks: [{ id: 1, time: '2025-04-15 10:00:00', content: '客户对五月份促销政策表示满意' }] },
    { id: 'cus2', code: 'CUS002', name: '宜居美学', type: '零售', contact: '李女士', phone: '13933334444', status: '启用', salesperson: '张经理', settlementMethod: '现金', approvalStatus: '审批通过' },
    { id: 'cus3', code: 'CUS003', name: '锦绣服饰旗舰店', type: '零售', contact: '王经理', phone: '13755556666', status: '启用', salesperson: '管理员', settlementMethod: '现结', approvalStatus: '审批通过' },
    { id: 'cus4', code: 'CUS004', name: '宏发商贸', type: '分销商', contact: '赵红', phone: '13677778888', status: '启用', salesperson: '张经理', settlementMethod: '预存', prepaidBalance: 15000, approvalStatus: '审批通过', feedbacks: [{ id: 2, time: '2025-04-20 11:00:00', content: '希望增加实木类产品的种类' }] },
    { id: 'cus5', code: 'CUS005', name: '博雅装饰', type: '独立店', contact: '孙博', phone: '13599990000', status: '启用', salesperson: '李仓库员', settlementMethod: '月结', approvalStatus: '待审批', hasOverdue: true },
    { id: 'cus6', code: 'CUS006', name: '瑞龙实业', type: '企业客户', contact: '周龙', phone: '13422223333', status: '启用', salesperson: '管理员', settlementMethod: '月结', approvalStatus: '审批通过' },
    { id: 'cus7', code: 'CUS007', name: '理想中心', type: '经销商', contact: '沈想', phone: '18911112222', status: '启用', salesperson: '张经理', settlementMethod: '预存', prepaidBalance: 20000, approvalStatus: '审批通过' }
  ],
  quotations: [
    { id: 'q1', quotationNo: 'BJ202504280001', customerId: 'cus1', customerName: '美家家居', quotationDate: '2025-04-28', salesperson: '张经理', totalAmount: 18000.00, status: '已审核', auditResult: '审核通过', title: '5月促销季备货报价', isDeposit: true, depositRate: 0.3, items: [
      { id: 'qi1', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', quantity: 4, price: 2500, amount: 10000, discountPrice: 9500 },
      { id: 'qi2', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', quantity: 2, price: 3200, amount: 6400, discountPrice: 6000 },
      { id: 'qi3', productCode: 'ACC001', productName: '不锈钢铰链', spec: '110度/自卸', unit: '对', quantity: 10, price: 12, amount: 120, discountPrice: 100 }
    ]},
    { id: 'q2', quotationNo: 'BJ202504270001', customerId: 'cus2', customerName: '宜居美学', quotationDate: '2025-04-27', salesperson: '管理员', totalAmount: 8500.00, status: '草稿', auditResult: null, title: '新款餐桌意向报价', isDeposit: false, items: [
      { id: 'qi4', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', quantity: 2, price: 3200, amount: 6400, discountPrice: 6400 },
      { id: 'qi5', productCode: 'ACC001', productName: '不锈钢铰链', spec: '110度/自卸', unit: '对', quantity: 6, price: 12, amount: 72, discountPrice: 72 }
    ]},
    { id: 'q3', quotationNo: 'BJ202504290001', customerId: 'cus4', customerName: '宏发商贸', quotationDate: '2025-04-29', salesperson: '张经理', totalAmount: 50000.00, status: '待审核', auditResult: null, title: '大客户年度集采', isDeposit: true, depositRate: 0.5, items: [
        { id: 'qi6', productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', unit: '组', quantity: 20, price: 1800, amount: 36000, discountPrice: 34000 },
        { id: 'qi7', productCode: 'MAT001', productName: '红橡木板材', spec: '2000*200*20', unit: 'm³', quantity: 2, price: 4500, amount: 9000, discountPrice: 8500 },
        { id: 'qi8', productCode: 'ACC001', productName: '不锈钢铰链', spec: '110度/自卸', unit: '对', quantity: 400, price: 12, amount: 4800, discountPrice: 4500 }
    ]}
  ],
  normalOrders: [
    {
        id: 'ord1',
        orderNo: 'SO20250428001',
        quotationNo: 'BJ202504280001',
        customerId: 'cus1',
        customerName: '美家家居',
        orderDate: '2025-04-28',
        expectDeliveryDate: '2025-05-15',
        totalAmount: 18000,
        paidAmount: 5000,
        salesperson: '张经理',
        includeInStockingPlan: true,
        settlementMethod: '月结',
        productionProgress: 45,
        deliveryProgressText: '发货中 (3/10)',
        deliveryNotices: 'DN20250429001',
        claimRecords: 'CR20250428001',
        status: '发货中',
        auditResult: '审批通过',
        paymentStatus: '部分结清',
        customerType: '经销商',
        isCollectDeposit: true,
        deposit: 5000,
        depositRatio: 27.7,
        items: [
          { id: 'oi1', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', quantity: 4, price: 2500, amount: 10000, shippedQuantity: 2, pendingQty: 2 },
          { id: 'oi2', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', quantity: 2, price: 3200, amount: 6400, shippedQuantity: 1, pendingQty: 1 }
        ]
    },
    {
        id: 'ord2',
        orderNo: 'SO20250426002',
        quotationNo: null,
        customerId: 'cus4',
        customerName: '宏发商贸',
        orderDate: '2025-04-26',
        expectDeliveryDate: '2025-05-10',
        totalAmount: 12000,
        paidAmount: 6000,
        salesperson: '管理员',
        includeInStockingPlan: false,
        settlementMethod: '预存',
        productionProgress: 100,
        deliveryProgressText: '待发货',
        deliveryNotices: '',
        claimRecords: 'CR20250426002',
        status: '已完工',
        auditResult: '审批通过',
        paymentStatus: '部分结清',
        customerType: '分销商',
        isCollectDeposit: true,
        deposit: 12000,
        depositRatio: 100,
        items: [
          { id: 'oi3', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', quantity: 3, price: 3200, amount: 9600, shippedQuantity: 0, pendingQty: 3 }
        ]
    },
    {
        id: 'ord3',
        orderNo: 'SO20250429003',
        quotationNo: 'BJ202504270001',
        customerId: 'cus2',
        customerName: '宜居美学',
        orderDate: '2025-04-29',
        expectDeliveryDate: '2025-05-25',
        totalAmount: 8500,
        paidAmount: 0,
        salesperson: '张经理',
        includeInStockingPlan: true,
        settlementMethod: '现金',
        productionProgress: 10,
        deliveryProgressText: '未发货',
        deliveryNotices: '',
        claimRecords: '',
        status: '已审核',
        auditResult: '审核通过',
        paymentStatus: '未收款',
        customerType: '零售',
        deposit: 0,
        depositRatio: 0,
        items: [
            { id: 'oi4', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', quantity: 2, price: 3200, amount: 6400, shippedQuantity: 0, pendingQty: 2 },
            { id: 'oi5', productCode: 'ACC001', productName: '餐椅', spec: '配套实木', unit: '把', quantity: 6, price: 350, amount: 2100, shippedQuantity: 0, pendingQty: 6 }
        ]
    },
    {
        id: 'ord4',
        orderNo: 'SO20250501004',
        customerId: 'cus1',
        customerName: '美家家居',
        orderDate: '2025-05-01',
        totalAmount: 5000,
        status: '草稿',
        salesperson: '张经理',
        items: [{ id: 'oi6', productName: '测试产品', quantity: 1, price: 5000, amount: 5000 }]
    },
    {
        id: 'ord5',
        orderNo: 'SO20250501005',
        customerId: 'cus2',
        customerName: '宜居美学',
        orderDate: '2025-05-01',
        totalAmount: 15000,
        status: '待审核',
        salesperson: '管理员',
        items: [{ id: 'oi7', productName: '实木餐床', quantity: 1, price: 15000, amount: 15000 }]
    },
    {
        id: 'ord6',
        orderNo: 'SO20250501006',
        customerId: 'cus3',
        customerName: '锦绣服饰旗舰店',
        orderDate: '2025-05-01',
        totalAmount: 20000,
        status: '已排产',
        productionProgress: 0,
        salesperson: '管理员',
        items: [{ id: 'oi8', productName: '陈列架', quantity: 10, price: 2000, amount: 20000 }]
    },
    {
        id: 'ord7',
        orderNo: 'SO20250501007',
        customerId: 'cus6',
        customerName: '瑞龙实业',
        orderDate: '2025-05-01',
        totalAmount: 30000,
        status: '生产中',
        productionProgress: 60,
        salesperson: '管理员',
        items: [{ id: 'oi9', productName: '办公家具套件', quantity: 1, price: 30000, amount: 30000 }]
    },
    {
        id: 'ord8',
        orderNo: 'SO20250501008',
        customerId: 'cus7',
        customerName: '理想中心',
        orderDate: '2025-05-01',
        totalAmount: 10000,
        status: '完成',
        paymentStatus: '已结清',
        salesperson: '张经理',
        items: [{ id: 'oi10', productName: '装饰画', quantity: 50, price: 200, amount: 10000 }]
    },
    {
        id: 'ord9',
        orderNo: 'SO20250501009',
        customerId: 'cus1',
        customerName: '美家家居',
        orderDate: '2025-05-01',
        totalAmount: 45000,
        status: '已完成',
        paymentStatus: '部分结清',
        salesperson: '张经理',
        items: [{ id: 'oi11', productName: '真皮沙发组合', quantity: 1, price: 45000, amount: 45000 }]
    },
    {
        id: 'ord10',
        orderNo: 'SO20250501010',
        customerId: 'cus4',
        customerName: '宏发商贸',
        orderDate: '2025-05-01',
        totalAmount: 2000,
        status: '已关闭',
        paymentStatus: '已结清',
        salesperson: '张经理',
        items: [{ id: 'oi12', productName: '样品AB', quantity: 1, price: 2000, amount: 2000 }]
    }
  ],
  consignmentOrders: [
    {
      id: 'co1',
      orderNo: 'WT20250429001',
      customerId: 'cus1',
      customerName: '美家家居',
      orderDate: '2025-04-29',
      expectDeliveryDate: '2025-05-20',
      status: '生产中',
      totalAmount: 3500,
      processingProgress: 35,
      deliveryProgressText: '待发货',
      salesperson: '张经理',
      receiptStatus: '已收来料',
      paymentStatus: '未结清',
      customerType: '经销商',
      incomingMaterials: [
        { materialCode: 'MAT001', materialName: '布匹', spec: '涤纶/蓝色', unit: '米', quantity: 100, receivedQty: 100 }
      ],
      processedItems: [
        { productCode: 'P001', productName: '裁剪', spec: '常规', unit: '米', quantity: 100, price: 10, amount: 1000 },
        { productCode: 'P002', productName: '缝纫', spec: '双针', unit: '米', quantity: 100, price: 25, amount: 2500 }
      ],
      feeSummary: {
        totalProcessFee: 3500,
        otherFee: 0,
        discount: 0,
        orderTotal: 3500
      }
    },
    {
      id: 'co2',
      orderNo: 'WT20250501002',
      customerId: 'cus2',
      customerName: '宜居美学',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-25',
      status: '草稿',
      totalAmount: 2000,
      processingProgress: 0,
      deliveryProgressText: '未发货',
      salesperson: '管理员',
      receiptStatus: '待收来料',
      paymentStatus: '未结清',
      customerType: '零售'
    },
    {
      id: 'co3',
      orderNo: 'WT20250501003',
      customerId: 'cus4',
      customerName: '宏发商贸',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-15',
      status: '待审核',
      totalAmount: 8000,
      processingProgress: 0,
      deliveryProgressText: '未发货',
      salesperson: '张经理',
      receiptStatus: '待收来料',
      paymentStatus: '未结清',
      customerType: '分销商'
    },
    {
      id: 'co4',
      orderNo: 'WT20250501004',
      customerId: 'cus1',
      customerName: '美家家居',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-10',
      status: '待发货',
      totalAmount: 12000,
      processingProgress: 100,
      deliveryProgressText: '待发货',
      salesperson: '管理员',
      receiptStatus: '待收来料',
      paymentStatus: '未结清',
      customerType: '经销商'
    },
    {
      id: 'co5',
      orderNo: 'WT20250501005',
      customerId: 'cus3',
      customerName: '锦绣服饰旗舰店',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-05',
      status: '已审核',
      totalAmount: 5000,
      processingProgress: 100,
      deliveryProgressText: '待发货',
      salesperson: '张经理',
      receiptStatus: '待收来料',
      paymentStatus: '未结清',
      customerType: '零售'
    },
    {
      id: 'co6',
      orderNo: 'WT20250501006',
      customerId: 'cus6',
      customerName: '瑞龙实业',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-08',
      status: '待发货',
      totalAmount: 15000,
      processingProgress: 100,
      deliveryProgressText: '准备发货',
      salesperson: '管理员',
      receiptStatus: '已收来料',
      paymentStatus: '部分结清',
      customerType: '企业客户'
    },
    {
      id: 'co7',
      orderNo: 'WT20250501007',
      customerId: 'cus7',
      customerName: '理想中心',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-03',
      status: '确认发运',
      totalAmount: 20000,
      processingProgress: 100,
      deliveryProgressText: '已发出',
      salesperson: '张经理',
      receiptStatus: '已收来料',
      paymentStatus: '已结清',
      customerType: '经销商'
    },
    {
      id: 'co8',
      orderNo: 'WT20250501008',
      customerId: 'cus4',
      customerName: '宏发商贸',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-02',
      status: '已完成',
      totalAmount: 2500,
      processingProgress: 100,
      deliveryProgressText: '已签收',
      salesperson: '管理员',
      receiptStatus: '已收来料',
      paymentStatus: '已结清',
      customerType: '分销商'
    },
    {
      id: 'co9',
      orderNo: 'WT20250501009',
      customerId: 'cus1',
      customerName: '美家家居',
      orderDate: '2025-05-01',
      expectDeliveryDate: '2025-05-01',
      status: '已关闭',
      totalAmount: 1000,
      processingProgress: 0,
      deliveryProgressText: '已撤回',
      salesperson: '张经理',
      receiptStatus: '待收来料',
      paymentStatus: '未结清',
      customerType: '经销商'
    }
  ],
  exchanges: [
    { 
      id: 'ex1', 
      exchangeNo: 'EX20250429001', 
      orderNo: 'SO20250428001', 
      customerName: '宜家(中国)有限公司', 
      orderDate: '2025-04-29', 
      date: '2025-04-29',
      status: '草稿', 
      returnStatus: '待收货',
      auditResult: null,
      reason: '色差问题',
      amount: 0, 
      salesperson: '王经理',
      items: [
        { id: 'exi1_1', productName: '配件A', quantity: 1, unitPrice: 100, action: '退回', currentReturnQuantity: 1, originalUnitPrice: 100 },
        { id: 'exi1_2', productName: '配件A', quantity: 1, unitPrice: 100, action: '换出' }
      ]
    },
    { 
      id: 'ex2', 
      exchangeNo: 'EX20250429002', 
      orderNo: 'SO20250428002', 
      customerName: '居然之家', 
      orderDate: '2025-04-29', 
      date: '2025-04-29',
      status: '待发货', 
      returnStatus: '待收货',
      auditResult: null,
      reason: '尺寸不符',
      amount: 0, 
      salesperson: '李主管',
      items: [
        { id: 'exi2_1', productName: '配件B', quantity: 2, unitPrice: 150, action: '退回', currentReturnQuantity: 2, originalUnitPrice: 150 },
        { id: 'exi2_2', productName: '配件B', quantity: 2, unitPrice: 150, action: '换出' }
      ]
    },
    { 
      id: 'ex3', 
      exchangeNo: 'EX20250429003', 
      orderNo: 'SO20250428003', 
      customerName: '红星美凯龙', 
      orderDate: '2025-04-29', 
      date: '2025-04-29',
      status: '待发货', 
      returnStatus: '待收货',
      auditResult: '审批拒绝',
      reason: '质量瑕疵',
      amount: 0, 
      salesperson: '李主管',
      items: [
        { id: 'exi3_1', productName: '配件C', quantity: 5, unitPrice: 200, action: '退回', currentReturnQuantity: 5, originalUnitPrice: 200 },
        { id: 'exi3_2', productName: '配件C', quantity: 5, unitPrice: 200, action: '换出' }
      ]
    },
    { 
      id: 'ex4', 
      exchangeNo: 'EX20250429004', 
      orderNo: 'SO20250428004', 
      customerName: '上海新世界', 
      orderDate: '2025-04-29', 
      date: '2025-04-29',
      status: '已发货', 
      returnStatus: '待收货',
      auditResult: null,
      reason: '客户要求更换颜色',
      amount: 0, 
      salesperson: '赵主管',
      items: [
        { id: 'exi4_1', productName: '配件D', quantity: 3, unitPrice: 300, action: '退回', currentReturnQuantity: 3, originalUnitPrice: 300 },
        { id: 'exi4_2', productName: '配件D', quantity: 3, unitPrice: 300, action: '换出' }
      ]
    },
    { 
      id: 'ex5', 
      exchangeNo: 'EX20250429005', 
      orderNo: 'SO20250428005', 
      customerName: '顾家家居', 
      orderDate: '2025-04-29', 
      date: '2025-04-29',
      status: '已完成', 
      returnStatus: '已收货',
      auditResult: '审批通过',
      reason: '发错货',
      amount: 0, 
      salesperson: '张经理',
      items: [
        { id: 'exi5_1', productName: '配件E', quantity: 10, unitPrice: 120, action: '退回', currentReturnQuantity: 10, originalUnitPrice: 120 },
        { id: 'exi5_2', productName: '配件E', quantity: 10, unitPrice: 120, action: '换出' }
      ]
    }
  ],
  replenishments: [
    { 
        id: 're1', 
        replenishNo: 'RE-REP-20250509-01', 
        orderNo: 'SO20250428001', 
        customerName: '美家家居', 
        orderDate: '2025-05-09', 
        status: '草稿', 
        salesperson: '张经理', 
        items: [{ id: 'rei1', productName: '配件A', quantity: 1, unitPrice: 100 }]
    },
    { 
        id: 're2', 
        replenishNo: 'RE-REP-20250509-02', 
        orderNo: 'SO20250428002', 
        customerName: '居然之家', 
        orderDate: '2025-05-09', 
        status: '待发货', 
        auditResult: '审批拒绝',
        salesperson: '李主管', 
        items: [{ id: 'rei2', productName: '配件B', quantity: 2, unitPrice: 150 }]
    },
    { 
        id: 're3', 
        replenishNo: 'RE-REP-20250509-03', 
        orderNo: 'SO20250428003', 
        customerName: '红星美凯龙', 
        orderDate: '2025-05-09', 
        status: '待发货', 
        auditResult: '审批拒绝',
        salesperson: '王经理', 
        items: [{ id: 'rei3', productName: '配件C', quantity: 5, unitPrice: 200 }]
    },
    { 
        id: 're4', 
        replenishNo: 'RE-REP-20250509-04', 
        orderNo: 'SO20250428004', 
        customerName: '宜家家居', 
        orderDate: '2025-05-09', 
        status: '已发货', 
        salesperson: '张销售', 
        items: [{ id: 'rei4', productName: '配件D', quantity: 3, unitPrice: 300 }]
    },
    { 
        id: 're5', 
        replenishNo: 'RE-REP-20250509-05', 
        orderNo: 'SO20250428005', 
        customerName: '顾家家居', 
        orderDate: '2025-05-09', 
        status: '已完成', 
        salesperson: '李业务', 
        items: [{ id: 'rei5', productName: '配件E', quantity: 10, unitPrice: 120 }]
    }
  ],
  returns: [
    { 
      id: 'ret1', 
      returnNo: 'RT20250429001', 
      sourceOrderNo: 'SO20250428001', 
      customerName: '美家家居', 
      customerType: '经销商', 
      orderDate: '2025-04-28', 
      date: '2025-04-29', 
      status: '草稿', 
      returnAmount: 320, 
      returnReason: '质量瑕疵', 
      salesperson: '张经理', 
      subsidiary: '广东分公司',
      items: [{ 
        id: 'rti1', 
        productCode: 'ACC001', 
        productName: '配件A', 
        spec: '标准/白色',
        property: '常规',
        unit: '个',
        originalQuantity: 50,
        shippedQuantity: 10,
        returnedQuantity: 0,
        returnQuantity: 2, 
        unitPrice: 160, 
        amount: 320,
        remark: '封板有损'
      }] 
    },
    { 
      id: 'ret2', 
      returnNo: 'RT20250429002', 
      sourceOrderNo: 'SO20250428002', 
      customerName: '绿城装修', 
      customerType: '总代', 
      orderDate: '2025-04-28', 
      date: '2025-04-29', 
      status: '待收货', 
      returnAmount: 200, 
      returnReason: '型号发错', 
      salesperson: '李销售', 
      subsidiary: '上海分公司',
      items: [{ 
        id: 'rti2', 
        productCode: 'ACC002', 
        productName: '配件B', 
        spec: '加厚/黑色',
        property: '定制',
        unit: '把',
        originalQuantity: 100,
        shippedQuantity: 5,
        returnedQuantity: 1,
        returnQuantity: 1, 
        unitPrice: 200, 
        amount: 200,
        remark: '误发型号'
      }] 
    },
    { 
      id: 'ret3', 
      returnNo: 'RT20250429003', 
      sourceOrderNo: 'SO20250428003', 
      customerName: '北京天汇', 
      customerType: '直营店', 
      orderDate: '2025-04-28', 
      date: '2025-04-29', 
      status: '待收货', 
      auditResult: '审批拒绝', 
      returnAmount: 300, 
      returnReason: '颜色不符', 
      salesperson: '王经理', 
      subsidiary: '北京分公司',
      items: [{ 
        id: 'rti3', 
        productCode: 'ACC003', 
        productName: '配件C', 
        spec: '小号/红色',
        property: '常规',
        unit: '套',
        originalQuantity: 30,
        shippedQuantity: 20,
        returnedQuantity: 0,
        returnQuantity: 3, 
        unitPrice: 100, 
        amount: 300,
        remark: '色差严重'
      }] 
    },
    { 
      id: 'ret4', 
      returnNo: 'RT20250429004', 
      sourceOrderNo: 'SO20250428004', 
      customerName: '上海新世界', 
      customerType: '大客户', 
      orderDate: '2025-04-28', 
      date: '2025-04-29', 
      status: '待财务审批', 
      returnAmount: 500, 
      returnReason: '有划痕', 
      salesperson: '赵主管', 
      subsidiary: '上海分公司',
      customerRemark: '外包装有破损',
      items: [{ 
        id: 'rti4', 
        productCode: 'ACC004', 
        productName: '配件D', 
        spec: '加宽/金色', 
        property: '常规', 
        unit: '个', 
        unitPrice: 500,
        originalPrice: 500,
        returnUnitPrice: 500,
        originalQuantity: 20, 
        shippedQuantity: 10, 
        returnedQuantity: 0, 
        returnQuantity: 1, 
        amount: 500 
      }] 
    },
    { 
      id: 'ret5', 
      returnNo: 'RT20250429005', 
      sourceOrderNo: 'SO20250428005', 
      customerName: '顾家家居', 
      customerType: '经销商', 
      orderDate: '2025-04-28', 
      date: '2025-04-29', 
      status: '待财务审批', 
      auditResult: '审批拒绝', 
      returnAmount: 600, 
      returnReason: '尺寸不对', 
      salesperson: '张经理', 
      subsidiary: '广东分公司',
      customerRemark: '客户急用，需尽快处理',
      items: [{ 
        id: 'rti5', 
        productCode: 'ACC005', 
        productName: '配件E', 
        spec: '标准/磨砂', 
        property: '常规', 
        unit: '套', 
        unitPrice: 300,
        originalPrice: 305,
        returnUnitPrice: 300,
        originalQuantity: 40, 
        shippedQuantity: 30, 
        returnedQuantity: 5, 
        returnQuantity: 2, 
        amount: 600 
      }] 
    },
    { id: 'ret6', returnNo: 'RT20250429006', sourceOrderNo: 'SO20250428006', customerName: '雅居家具城', customerType: '代理商', orderDate: '2025-04-28', date: '2025-04-29', status: '已完成', returnAmount: 150, returnReason: '质量问题', salesperson: '刘销售', items: [{ id: 'rti6', productCode: 'ACC006', productName: '配件F', returnQuantity: 1, unitPrice: 150, amount: 150 }] },
    { id: 'ret7', returnNo: 'RT20250429007', sourceOrderNo: 'SO20250428007', customerName: '阳光城物业', customerType: '客户', orderDate: '2025-04-28', date: '2025-04-29', status: '已关闭', returnAmount: 500, returnReason: '客户协商撤销', salesperson: '张经理', items: [{ id: 'rti7', productCode: 'ACC007', productName: '配件G', returnQuantity: 5, unitPrice: 100, amount: 500 }] },
  ],
  estimations: [
    { id: 'est1', orderNo: 'EST20250429001', productName: '定制衣柜', productCode: 'PROD001', customerName: '美家家居', basePrice: 5000, totalPrice: 8500, status: '草稿', date: '2025-04-29', remark: '含五金件升级', customSize: { length: 240, width: 60, height: 210 } },
    { id: 'est2', orderNo: 'EST20250501002', productName: '豪华双人床', productCode: 'PROD002', customerName: '宜居美学', basePrice: 8000, totalPrice: 12000, status: '草稿', date: '2025-05-01', remark: '软包升级', customSize: { length: 220, width: 200, height: 120 } }
  ],
  inboundOrders: [
    { 
      id: 'in1', 
      orderNo: 'PI-202504230001', 
      type: '采购入库', 
      warehouseName: '原材料仓库', 
      status: '已入库', 
      inboundDate: '2025-04-23', 
      partnerName: '广东华美木业有限公司', 
      auditResult: '',
      operator: '管理员',
      auditTime: '2025-04-23 10:00:00',
      remark: '首批原材料到货',
      items: [{ productCode: 'MAT001', productName: '红橡木板材', quantity: 2, unit: 'm³', spec: '2000*200*20', price: 4200.00, warehouseName: '原材料仓库', bin: 'R-01-01' }] 
    },
    { 
      id: 'in2', 
      orderNo: 'PD-202504250001', 
      type: '生产入库', 
      warehouseName: '主成品仓库', 
      status: '已入库', 
      inboundDate: '2025-04-25', 
      partnerName: '车间一组', 
      auditResult: '',
      operator: '管理员',
      auditTime: '2025-04-25 15:30:00',
      remark: '沙发成品入库',
      items: [{ productCode: 'PROD001', productName: '皮沙发', quantity: 10, unit: '个', spec: '真皮/咖啡色', price: 2500.00, warehouseName: '主成品仓库', bin: 'A-01-01', batchNo: '20250425PD001' }] 
    },
    { 
      id: 'in3', 
      orderNo: 'RI-202504260001', 
      type: '退货入库', 
      warehouseName: '主成品仓库', 
      status: '草稿', 
      inboundDate: '2025-04-26', 
      partnerName: '美家家居',
      auditResult: '-',
      operator: '管理员',
      remark: '客户退货草稿',
      items: [{ productCode: 'PROD001', productName: '皮沙发', quantity: 1, unit: '个', spec: '真皮/咖啡色', price: 2500.00, warehouseName: '主成品仓库', bin: 'A-01-01' }] 
    },
    {
      id: 'in4', 
      orderNo: 'PI-202505090001', 
      relOrderNo: 'PO-20250509-01',
      type: '采购入库', 
      warehouseName: '原材料仓库', 
      status: '待审核', 
      inboundDate: '2025-05-09', 
      partnerName: '辅料供应中心B', 
      auditResult: '待审',
      operator: '李仓库员',
      remark: '待审核采购单',
      items: [{ productCode: 'ACC001', productName: '不锈钢铰链', quantity: 500, pendingQty: 500, unit: '对', spec: '110度/自卸', price: 12.00, warehouseName: '原材料仓库', bin: 'R-01-02' }]
    },
    {
      id: 'in5', 
      orderNo: 'SI-202505090001', 
      relOrderNo: 'SCP-20250509-01',
      type: '委外入库', 
      warehouseName: '原材料仓库', 
      status: '已审核', 
      inboundDate: '2025-05-09', 
      partnerName: '顺德精工机械厂', 
      auditResult: '通过',
      operator: '管理员',
      auditTime: '2025-05-09 11:00:00',
      remark: '已审核委外入库',
      items: [{ productCode: 'ACC001', productName: '不锈钢铰链', quantity: 100, processQty: 200, finishedQty: 100, unit: '对', spec: '110度/自卸', price: 5.5, warehouseName: '原材料仓库', bin: 'R-01-01' }]
    },
    {
      id: 'in6', 
      orderNo: 'SI-202505090002', 
      relOrderNo: 'SCP-20250509-02',
      type: '委外入库', 
      warehouseName: '主成品仓库', 
      status: '草稿', 
      inboundDate: '2025-05-08', 
      partnerName: '东莞模具中心', 
      auditResult: '-',
      operator: '管理员',
      remark: '委外草稿',
      items: [{ productCode: 'PROD001', productName: '皮沙发', quantity: 50, processQty: 100, finishedQty: 0, unit: '个', spec: '真皮/咖啡色', price: 15.0, warehouseName: '主成品仓库', bin: 'A-01-02' }]
    },
    { 
      id: 'in7', 
      orderNo: 'PD-202504280001', 
      type: '生产入库', 
      warehouseName: '主成品仓库', 
      status: '已入库', 
      inboundDate: '2025-04-28', 
      partnerName: '车间二组', 
      auditResult: '',
      operator: '管理员',
      auditTime: '2025-04-28 09:00:00',
      remark: '常规成品入库',
      items: [
        { productCode: 'PROD002', productName: '实木餐桌', quantity: 5, unit: '张', spec: '1.6m圆形', price: 3200.00, warehouseName: '主成品仓库', bin: 'A-01-01' },
        { productCode: 'PROD003', productName: '极简书架', quantity: 10, unit: '组', spec: '胡桃木', price: 1800.00, warehouseName: '主成品仓库', bin: 'A-01-02' }
      ] 
    },
    { 
      id: 'in8', 
      orderNo: 'RI-202504280002', 
      relOrderNo: 'AS-20250428-01',
      type: '退货入库', 
      warehouseName: '主成品仓库', 
      status: '待审核', 
      inboundDate: '2025-04-28', 
      partnerName: '宜居美学', 
      auditResult: '-',
      operator: '管理员',
      remark: '终端客户退货待审核',
      items: [{ productCode: 'PROD002', productName: '实木餐桌', quantity: 1, returnQty: 1, unit: '张', spec: '1.6m圆形', price: 3200.00, warehouseName: '主成品仓库', bin: 'A-01-01' }] 
    },
    { 
      id: 'in14', 
      orderNo: 'RI-202505100001', 
      relOrderNo: 'AS-20250510-01',
      type: '退货入库', 
      warehouseName: '主成品仓库', 
      status: '待审核', 
      inboundDate: '2025-05-10', 
      partnerName: '宜居美学', 
      auditResult: '-',
      operator: '管理员',
      remark: '新增退货入库1',
      items: [{ productCode: 'PROD002', productName: '实木餐桌', quantity: 2, returnQty: 2, unit: '张', spec: '1.6m圆形', price: 3200.00, warehouseName: '主成品仓库', bin: 'A-01-01' }] 
    },
    { 
      id: 'in15', 
      orderNo: 'RI-202505100002', 
      relOrderNo: 'AS-20250510-02',
      type: '退货入库', 
      warehouseName: '主成品仓库', 
      status: '草稿', 
      inboundDate: '2025-05-10', 
      partnerName: '美家家居', 
      auditResult: '-',
      operator: '管理员',
      remark: '新增退货入库2',
      items: [{ productCode: 'PROD001', productName: '皮沙发', quantity: 1, returnQty: 1, unit: '个', spec: '真皮/咖啡色', price: 2500.00, warehouseName: '主成品仓库', bin: 'A-01-01' }] 
    },
    { 
      id: 'in16', 
      orderNo: 'RI-202505100003', 
      relOrderNo: 'AS-20250510-03',
      type: '退货入库', 
      warehouseName: '主成品仓库', 
      status: '已审核', 
      inboundDate: '2025-05-10', 
      partnerName: '理想中心', 
      auditResult: '通过',
      operator: '管理员',
      remark: '新增退货入库3',
      items: [{ productCode: 'PROD003', productName: '极简书架', quantity: 3, returnQty: 3, unit: '组', spec: '胡桃木', price: 1800.00, warehouseName: '主成品仓库', bin: 'A-01-02' }] 
    },
    { 
      id: 'in17', 
      orderNo: 'RI-202505100004', 
      relOrderNo: 'AS-20250510-04',
      type: '退货入库', 
      warehouseName: '主成品仓库', 
      status: '已入库', 
      inboundDate: '2025-05-10', 
      partnerName: '美家家居', 
      auditResult: '',
      operator: '管理员',
      remark: '新增退货入库4',
      items: [{ productCode: 'PROD002', productName: '实木餐桌', quantity: 1, returnQty: 1, unit: '张', spec: '1.6m圆形', price: 3200.00, warehouseName: '主成品仓库', bin: 'A-01-01' }] 
    },
    {
      id: 'in12', 
      orderNo: 'CI-202505100001', 
      relOrderNo: 'CSO-20250510-01',
      type: '受托入库', 
      warehouseName: '主仓库', 
      status: '待审核', 
      inboundDate: '2025-05-10', 
      partnerName: '博雅装饰', 
      auditResult: '-',
      operator: '李仓库员',
      remark: '受托入库待审核',
      items: [{ productCode: 'PROD003', productName: '极简书架', quantity: 20, orderQty: 20, unit: '组', spec: '胡桃木', price: 1800.00, warehouseName: '主仓库', bin: 'A-01-02' }]
    },
    {
      id: 'in13', 
      orderNo: 'CI-202505100002', 
      type: '受托入库', 
      warehouseName: '辅料仓库', 
      status: '草稿', 
      inboundDate: '2025-05-10', 
      partnerName: '瑞龙实业', 
      auditResult: '-',
      operator: '管理员',
      remark: '受托入库草稿',
      items: [{ productCode: 'ACC001', productName: '不锈钢铰链', quantity: 100, orderQty: 100, unit: '对', spec: '110度/自卸', price: 12.00, warehouseName: '辅料仓库', bin: 'F-01-01' }]
    },
    {
      id: 'in11', 
      orderNo: 'PI-202505090002', 
      relOrderNo: 'PO-20250509-02',
      type: '采购入库', 
      warehouseName: '原材料仓库', 
      status: '待审核', 
      inboundDate: '2025-05-09', 
      partnerName: '博雅装饰', 
      auditResult: '-',
      operator: '李仓库员',
      remark: '采购待审核',
      items: [{ productCode: 'ACC002', productName: '抽屉滑轨', quantity: 100, pendingQty: 200, unit: '对', spec: '450mm/阻尼', price: 25.00, warehouseName: '原材料仓库', bin: 'R-01-03' }]
    },
    {
      id: 'in18', 
      orderNo: 'PI-202505100001', 
      relOrderNo: 'PO-20250510-01',
      type: '采购入库', 
      warehouseName: '原材料仓库', 
      status: '已审核', 
      inboundDate: '2025-05-10', 
      partnerName: '华泰供应', 
      auditResult: '拒绝',
      operator: '管理员',
      remark: '质量不符，审核拒绝',
      items: [{ productCode: 'ACC003', productName: '自攻螺丝', quantity: 1000, pendingQty: 1000, unit: '个', spec: 'M4*16', price: 0.1, warehouseName: '原材料仓库', bin: 'R-01-03' }]
    }
  ],
  outboundOrders: [
    { 
      id: 'out1', 
      orderNo: 'OUT20250429001', 
      type: '销售出库', 
      warehouseName: '主成品仓库', 
      status: '已出库', 
      date: '2025-04-29', 
      partnerName: '美家家居', 
      auditResult: '',
      items: [{ productCode: 'PROD001', productName: '皮沙发', quantity: 2, unit: '个', spec: '真皮/咖啡色' }] 
    },
    { 
      id: 'out2', 
      orderNo: 'OUT20250429002', 
      type: '领料出库', 
      warehouseName: '原材料仓库', 
      status: '已出库', 
      date: '2025-04-29', 
      partnerName: '生产一部', 
      auditResult: '',
      items: [{ productCode: 'MAT001', productName: '布匹', quantity: 10, unit: '米', spec: '涤纶/蓝色' }] 
    },
    { 
      id: 'out3', 
      orderNo: 'OUT20250430003', 
      type: '委外出库', 
      warehouseName: '原材料仓库', 
      status: '待审核', 
      date: '2025-04-30', 
      partnerName: '顺德外协厂', 
      relOrderNo: 'SPO20250430001',
      operator: '李仓库员',
      auditResult: '-',
      items: [
        { productCode: 'MAT001', productName: '红橡木板材', quantity: 5, unit: 'm³', spec: '2000*200*20', remark: '外协加工用料' }
      ] 
    },
    { 
      id: 'out4', 
      orderNo: 'OUT20250501004', 
      type: '其他出库', 
      warehouseName: '主成品仓库', 
      status: '草稿', 
      date: '2025-05-01', 
      partnerName: '行政部', 
      category: '办公领用',
      relOrderNo: 'REQ20250501001',
      applicant: '张三',
      department: '行政部',
      operator: '管理员',
      auditResult: '-',
      items: [
        { productCode: 'PROD003', productName: '极简书架', quantity: 1, unit: '组', spec: '胡桃木', applyQty: 1 }
      ] 
    },
    { 
      id: 'out5', 
      orderNo: 'OUT20250502005', 
      type: '其他出库', 
      warehouseName: '主成品仓库', 
      status: '已审核', 
      date: '2025-05-02', 
      partnerName: '广东华美木业有限公司', 
      auditResult: '通过',
      items: [{ productCode: 'MAT001', productName: '疵品', quantity: 1, unit: 'm³' }] 
    },
    { 
      id: 'out6', 
      orderNo: 'OUT20250503006', 
      type: '委外出库', 
      warehouseName: '原材料仓库', 
      status: '待审核', 
      date: '2025-05-03', 
      partnerName: '联塑科技', 
      auditResult: '拒绝',
      items: [{ productCode: 'MAT002', productName: '辅料', quantity: 50, unit: 'kg' }] 
    },
    { 
      id: 'out7', 
      orderNo: 'OUT20250504007', 
      type: '其他出库', 
      warehouseName: '主成品仓库', 
      status: '待审核', 
      date: '2025-05-04', 
      partnerName: '研发部', 
      category: '研发领用',
      relOrderNo: 'REQ20250504001',
      applicant: '李工',
      department: '研发部',
      operator: '管理员',
      auditResult: '-',
      items: [
        { productCode: 'MAT002', productName: '新材料样本', quantity: 2, unit: 'kg', spec: '高密度', applyQty: 2 }
      ] 
    }
  ],
  stocktakingTasks: [
    { 
      id: 'st1', taskNo: 'ST20250429001', warehouseName: '主成品仓库', status: '已完成', creator: '管理员', createDate: '2025-04-29', type: '全盘', rangeType: '全部物料', rangeDesc: '全部物料', finishDate: '2025-04-30', planStartDate: '2025-04-29', planEndDate: '2025-04-30',
      diffResult: [
        { location: 'A-01-01', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', batchNo: 'B250401', bookQty: 100, actualQty: 108, diffQty: 8, diffAmount: 20000, resultStatus: '通过' },
        { location: 'A-01-02', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', batchNo: 'B250402', bookQty: 50, actualQty: 48, diffQty: -2, diffAmount: -6400, resultStatus: '异常' }
      ]
    },
    { id: 'st2', taskNo: 'ST20250501002', warehouseName: '原材料仓库', status: '盘点中', creator: '管理员', createDate: '2025-05-01', type: '动盘', rangeType: '按物料分类', rangeDesc: '按物料分类: 五金配件类', planStartDate: '2025-05-01', planEndDate: '2025-05-02' },
    { id: 'st3', taskNo: 'ST20250505003', warehouseName: '广州总仓', status: '草稿', creator: '张经理', createDate: '2025-05-05', type: '抽盘', rangeType: '按货位', rangeDesc: '按货位: A-01-01', planStartDate: '2025-05-06', planEndDate: '2025-05-07' },
    { 
      id: 'st4', taskNo: 'ST20250504004', warehouseName: '珠海分仓', status: '待审批', creator: '李瑞', createDate: '2025-05-04', type: '全盘', rangeType: '按物料', rangeDesc: '按物料: 12 项', planStartDate: '2025-05-04', planEndDate: '2025-05-05',
      diffResult: [
        { location: 'B-02-01', productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', batchNo: 'B250503', bookQty: 20, actualQty: 18, diffQty: -2, diffAmount: -3600, resultStatus: '待处理' },
        { location: 'B-02-02', productCode: 'MAT001', productName: '红橡木板材', spec: '2000*200*20', batchNo: 'B250504', bookQty: 100, actualQty: 100, diffQty: 0, diffAmount: 0, resultStatus: '待处理' }
      ]
    }
  ],
  warehouses: [
    { id: 'w1', name: '广州总仓' },
    { id: 'w2', name: '珠海分仓' },
    { id: 'w3', name: '主成品仓库' },
    { id: 'w4', name: '原材料仓库' }
  ],
  suppliers: [
    { id: 'sup1', name: '优质材料供应商A' },
    { id: 'sup2', name: '辅料供应中心B' }
  ],
  bankAccounts: [
    { id: 'ba1', name: '工商银行 - 5678', accountNo: '6222...5678' },
    { id: 'ba2', name: '建设银行 - 1234', accountNo: '6217...1234' }
  ],
  bankFlows: [
    { id: 'bf1', flowNo: 'FLOW20250428001', accountName: '工商银行 - 5678', amount: 5000, type: '流入', status: '已认领', date: '2025-04-28', payer: '美家家居' },
    { id: 'bf2', flowNo: 'FLOW20250429001', accountName: '建设银行 - 1234', amount: 10000, type: '流入', status: '待认领', date: '2025-04-29', payer: '宜居美学' }
  ],
  claimRecords: [
    { id: 'cr1', recordNo: 'CR20250428001', flowNo: 'FLOW20250428001', orderNo: 'SO20250428001', orderType: '销售订单', customerName: '美家家居', claimAmount: 5000, claimTime: '2025-04-28 14:00', claimUser: '管理员', status: '审批通过' }
  ],
  products: [
    { id: 'p1', code: 'PROD001', name: '皮沙发', spec: '真皮/咖啡色', unit: '个', price: 2500, materialCategory: '生产物料', category: '成品', standardCost: 1500, stock: 45, isSalable: true, batchNo: 'B20250429', warehouse: '主成品仓库', location: 'A-01-01', safeQty: 20, lastCheckDate: '2025-04-20', department: '-', user: '-' },
    { id: 'p2', code: 'PROD002', name: '实木餐桌', spec: '1.6m圆形', unit: '张', price: 3200, materialCategory: '生产物料', category: '成品', standardCost: 2000, stock: 12, isSalable: true, batchNo: 'B20250429', warehouse: '主成品仓库', location: 'A-01-02', safeQty: 10, lastCheckDate: '2025-04-20', department: '-', user: '-' },
    { id: 'p3', code: 'PROD003', name: '极简书架', spec: '胡桃木', unit: '组', price: 1800, materialCategory: '生产物料', category: '成品', standardCost: 1000, stock: 5, isSalable: true, batchNo: 'B20250430', warehouse: '主成品仓库', location: 'A-01-03', safeQty: 10, lastCheckDate: '2025-04-25', department: '-', user: '-' },
    { id: 'p4', code: 'MAT001', name: '红橡木板材', spec: '2000*200*20', unit: 'm³', price: 4500, materialCategory: '生产物料', category: '原材料', standardCost: 3500, stock: 25, isSalable: false, batchNo: 'B20250429', warehouse: '原材料仓库', location: 'R-01-01', safeQty: 50, lastCheckDate: '2025-04-25', department: '-', user: '-' },
    { id: 'p5', code: 'ACC001', name: '不锈钢铰链', spec: '110度/自卸', unit: '对', price: 12, materialCategory: '生产物料', category: '原材料', standardCost: 8, stock: 1000, isSalable: true, batchNo: 'B20250430', warehouse: '原材料仓库', location: 'R-01-02', safeQty: 100, lastCheckDate: '2025-04-18', department: '-', user: '-' },
    { id: 'p6', code: 'CONS001', name: 'A4打印纸', spec: '80g/500张', unit: '包', price: 35, materialCategory: '低值易耗品', category: '-', standardCost: 25, stock: 25, isSalable: false, batchNo: '-', warehouse: '综合行政中心', location: 'Office-01', safeQty: 50, lastCheckDate: '2025-04-28', department: '-', user: '-' },
    { id: 'p7', code: 'FIX001', assetCode: 'ASSET-2024-001', name: '服务器', spec: 'DELL PowerEdge R740', unit: '台', price: 35000, materialCategory: '固定资产', category: '-', standardCost: 28000, stock: 2, isSalable: false, batchNo: 'SN-202409012', warehouse: '机房', location: 'Rack-01', safeQty: 1, lastCheckDate: '2025-03-15', department: '技术部', user: '张三' },
    { id: 'p8', code: 'FIX002', assetCode: 'ASSET-2024-002', name: '人体工学椅', spec: '网易严选', unit: '把', price: 1299, materialCategory: '固定资产', category: '-', standardCost: 800, stock: 120, isSalable: false, batchNo: '-', warehouse: '二楼办公区', location: 'Area-B12', safeQty: 10, lastCheckDate: '2025-05-01', department: '行政部', user: '李四' }
  ],
  recharges: [
    { 
      id: 'cz1', 
      orderNo: 'CZ202504230001', 
      customerId: 'cus001', 
      customerName: '美家家居', 
      customerCode: 'C001', 
      customerType: '独立店', 
      date: '2025-04-23', 
      amount: 3000, 
      status: null, 
      salesperson: '张三', 
      remark: '年度活动充值' 
    },
    { 
      id: 'cz2', 
      orderNo: 'CZ202504240001', 
      customerId: 'cus002', 
      customerName: '雅居饰界', 
      customerCode: 'C002', 
      customerType: '分销商', 
      date: '2025-04-24', 
      amount: 50000, 
      status: null, 
      salesperson: '李四', 
      remark: '预存货款' 
    },
    { 
      id: 'cz3', 
      orderNo: 'CZ202504250001', 
      customerId: 'cus002', 
      customerName: '雅居饰界', 
      customerCode: 'C002', 
      customerType: '分销商', 
      date: '2025-04-25', 
      amount: 30000, 
      status: null, 
      salesperson: '李四', 
      remark: '追加预存' 
    },
    { 
      id: 'cz4', 
      orderNo: 'CZ202504260001', 
      customerId: 'cus007', 
      customerName: '全友家居服务中心', 
      customerCode: 'C007', 
      customerType: '特许经营', 
      date: '2025-04-26', 
      amount: 120000, 
      status: null, 
      salesperson: '李四', 
      remark: '大额入金' 
    }
  ],
  sizeRules: [
    { 
      id: 'sr1', 
      productCode: 'PROD001', 
      productName: '皮沙发', 
      productSpec: '真皮/咖啡色',
      baseSize: { length: 200, width: 90, height: 80 },
      lengthStep: { enabled: true, steps: [{ start: 0, end: 200, price: 0 }, { start: 201, end: 250, price: 500 }, { start: 251, end: 999999, price: 1000 }] },
      widthStep: { enabled: false, steps: [] },
      heightStep: { enabled: false, steps: [] },
      coefficient: 1.2,
      isActive: true,
      status: '审批通过'
    },
    { 
      id: 'sr2', 
      productCode: 'PROD002', 
      productName: '实木餐桌', 
      productSpec: '1.6m圆形',
      baseSize: { length: 160, width: 160, height: 75 },
      lengthStep: { enabled: true, steps: [{ start: 0, end: 160, price: 0 }, { start: 161, end: 200, price: 800 }, { start: 201, end: 999999, price: 1500 }] },
      widthStep: { enabled: true, steps: [{ start: 0, end: 160, price: 0 }, { start: 161, end: 200, price: 800 }, { start: 201, end: 999999, price: 1500 }] },
      heightStep: { enabled: false, steps: [] },
      coefficient: 1.5,
      isActive: true,
      status: '审批通过'
    },
    { 
      id: 'sr3', 
      productCode: 'PROD003', 
      productName: '极简书架', 
      productSpec: '胡桃木',
      baseSize: { length: 120, width: 35, height: 200 },
      lengthStep: { enabled: true, steps: [{ start: 0, end: 120, price: 0 }, { start: 121, end: 150, price: 300 }, { start: 151, end: 999999, price: 700 }] },
      widthStep: { enabled: false, steps: [] },
      heightStep: { enabled: true, steps: [{ start: 0, end: 200, price: 0 }, { start: 201, end: 240, price: 400 }, { start: 241, end: 999999, price: 900 }] },
      coefficient: 1.1,
      isActive: true,
      status: '已失效'
    }
  ],
  deliveryNotices: [
    { 
      id: 'dn1', 
      noticeNo: 'FH20250429001', 
      orderNo: 'SOD-20250423-0001', 
      customerName: '美家家居', 
      status: '草稿', 
      approvalStatus: '待审批',
      auditResult: '-',
      date: '2025-04-29', 
      salesperson: '张经理',
      totalAmount: 18000,
      contactName: '张总',
      region: '华南大区',
      expectDate: '2025-05-02',
      items: [
        { id: 'dni1', productName: '皮沙发', spec: '真皮/咖啡色', quantity: 2, price: 9500, amount: 19000 }
      ]
    },
    { 
      id: 'dn-cash-1', 
      noticeNo: 'FH20250511-C01', 
      orderNo: 'SOD-20250510-0099', 
      customerName: '家和电器商店', 
      status: '待财务审批', 
      settlementMethod: '现金',
      approvalStatus: '待审批',
      auditResult: '',
      date: '2025-05-11', 
      createdAt: '2025-05-11 10:00:00',
      salesperson: '王经理',
      totalAmount: 5600,
      contactName: '李老板',
      region: '西南大区',
      items: [
        { id: 'dni-c1', productName: '台灯', spec: '白色/LED', quantity: 20, currentQty: 20, price: 280, amount: 5600 }
      ]
    },
    { 
      id: 'dn2', 
      noticeNo: 'FH20250429002', 
      orderNo: 'SOD-20250426-0002', 
      customerName: '宜居美学', 
      status: '待财务审批', 
      approvalStatus: '待审批',
      auditResult: '-',
      date: '2025-04-29', 
      createdAt: '2025-04-29 09:00:15',
      salesperson: '管理员',
      settlementMethod: '现结',
      totalAmount: 12000,
      otherFee: 200,
      contactName: '李女士',
      region: '华东大区',
      expectDate: '2025-05-05',
      items: [
        { id: 'dni2', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', orderQty: 10, shippedQty: 2, currentQty: 1, unitPrice: 6000, amount: 6000 }
      ],
      attachments: [{ name: '合同扫描件.pdf' }],
      paymentImages: [{ url: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=200' }]
    },
    { 
      id: 'dn3', 
      noticeNo: 'FH20250429003', 
      orderNo: 'SOD-20250427-0001', 
      customerName: '宏发商贸', 
      status: '待仓库审批', 
      approvalStatus: '待审批',
      auditResult: '通过',
      date: '2025-04-29', 
      createdAt: '2025-04-28 15:45:00',
      salesperson: '张经理',
      settlementMethod: '月结',
      totalAmount: 50000,
      contactName: '赵红',
      region: '西南大区',
      expectDate: '2025-05-01',
      items: [
        { id: 'dni3', productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', orderQty: 20, shippedQty: 10, currentQty: 5, unitPrice: 1700, amount: 8500 }
      ],
      financeAuditResult: '通过',
      financeAuditRemark: '余额充足，同意发货',
      financeAuditor: '财务主管',
      financeAuditTime: '2025-04-29 10:20:00'
    },
    { 
      id: 'dn_rejected', 
      noticeNo: 'FH20250429004', 
      orderNo: 'SOD-20250428-0002', 
      customerName: '创新科技', 
      status: '待仓库审批', 
      approvalStatus: '未通过',
      auditResult: '审批通过',
      date: '2025-04-29', 
      createdAt: '2025-04-29 11:00:15',
      salesperson: '王业务',
      settlementMethod: '月结',
      totalAmount: 18000,
      contactName: '刘强',
      region: '华南大区',
      expectDate: '2025-05-08',
      items: [
        { id: 'dni_r', productCode: 'PROD004', productName: '办公桌', spec: '1.2m', orderQty: 10, shippedQty: 0, currentQty: 10, unitPrice: 1800, amount: 18000 }
      ]
    },
    { 
      id: 'dn5', 
      noticeNo: 'FH20250429005', 
      orderNo: 'SOD-20250429-0001', 
      customerName: '创意空间', 
      status: '已审批', 
      approvalStatus: '已审批',
      auditResult: '-',
      date: '2025-04-30', 
      salesperson: '管理员',
      totalAmount: 25000,
      contactName: '沈想',
      region: '华南大区',
      expectDate: '2025-05-10',
      items: [
        { id: 'dni5', productName: '电脑椅', spec: '人体工学', quantity: 10, price: 1200, amount: 12000 }
      ]
    }
  ],
  flows: [
    { 
      id: 'f1', 
      flowNo: 'FLOW20250428001', 
      orderNo: 'SO20250428001', 
      amount: 5000, 
      type: '认领', 
      date: '2025-04-28',
      claims: [
        { 
          id: 'clm1', 
          orderNo: 'SOD-20250423-0001', 
          customerName: '美家家居',
          salesman: '张经理',
          orderTotalAmount: 18000,
          orderReceivedAmount: 13000,
          orderPendingAmount: 5000,
          claimRatio: 100,
          claimAmount: 5000,
          claimant: '财务王',
          claimTime: '2025-04-28 14:00:00',
          remark: '确认到账认领',
          status: '审批通过'
        }
      ]
    },
    {
      id: 'f2',
      flowNo: 'FLOW20250429001',
      orderNo: '',
      amount: 10000,
      type: '流入',
      date: '2025-04-29',
      payer: '宜居美学',
      status: '待认领',
      claims: []
    }
  ],
  auditRecords: {
    'ord1': [{ time: '2025-04-28 10:00:00', operator: '管理员', action: '提交审核', opinion: '无' }],
    'q1': [{ time: '2025-04-28 09:00:00', operator: '张经理', action: '提交审核', opinion: '申请特价' }],
    'tp-001': [
      { time: '2025-04-28 10:00:00', operator: '管理员', action: '提交审核', opinion: '客户急需' },
      { time: '2025-04-28 11:30:00', operator: '张经理', action: '审核通过', opinion: '已确认交期' }
    ],
    'tp-002': [
      { time: '2025-04-25 09:00:00', operator: '张经理', action: '提交审核', opinion: '常规加工' },
      { time: '2025-04-25 10:15:00', operator: '管理员', action: '审核通过', opinion: '通过' }
    ],
    'tp-004': [
      { time: '2025-05-02 14:00:00', operator: '张经理', action: '提交审核', opinion: '加急处理' },
      { time: '2025-05-02 15:00:00', operator: '管理员', action: '审核通过', opinion: '优先排产' }
    ],
    'co6': [
      { time: '2025-05-01 09:00:00', operator: '管理员', action: '提交审核', opinion: '受托加工订单' },
      { time: '2025-05-01 10:00:00', operator: '张经理', action: '审核通过', opinion: '资料完善' }
    ],
    'co7': [
      { time: '2025-05-01 08:30:00', operator: '张经理', action: '提交审核', opinion: '客户着急' },
      { time: '2025-05-01 09:15:00', operator: '管理员', action: '审核通过', opinion: '同意' }
    ],
    'co8': [
      { time: '2025-05-01 10:10:00', operator: '管理员', action: '提交审核', opinion: '常规受托' },
      { time: '2025-05-01 11:00:00', operator: '张经理', action: '审核通过', opinion: 'OK' }
    ]
  },
  priceVersions: [
    { id: 'pv1', categoryId: 'cat1', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' }
  ],
  batches: [
    { id: 'b1', batchNo: 'BATCH20250429001', relOrderNo: 'WO20250429001', warehouseName: '主成品仓库', location: 'A-01-01', createDate: '2025-04-29', status: '有效' },
    { id: 'b2', batchNo: 'B20260510001', relOrderNo: 'WO20260510001', warehouseName: '广州总仓', location: 'G-01-01', createDate: '2026-05-10', status: '有效' },
    { id: 'b3', batchNo: 'B20260510002', relOrderNo: 'WO20260510002', warehouseName: '珠海分仓', location: 'Z-02-05', createDate: '2026-05-10', status: '有效' },
    { id: 'b4', batchNo: 'B20250501001', relOrderNo: 'WO20250501001', warehouseName: '深圳中转库', location: 'S-03-01', createDate: '2025-05-01', status: '已占用' },
    { id: 'b5', batchNo: 'B20250501002', relOrderNo: 'WO20250501002', warehouseName: '杭州备货中心', location: 'H-01-12', createDate: '2025-05-01', status: '有效' }
  ],
  labelRules: [
    { id: 'lr1', name: '成品标签', template: 'NAME-CODE-DATE', status: '启用' }
  ],
  subcontractPurchaseOrders: [
    { 
      id: 'spo1', 
      orderNo: 'SPO20250509001', 
      supplierName: '顺德精工机械厂', 
      orderDate: '2025-05-09', 
      summary: '配件A加工 500个',
      items: [
        { id: 'spoi1', productCode: 'ACC001', productName: '不锈钢铰链', spec: '110度/自卸', unit: '对', quantity: 500, receivedQty: 100, price: 5.5 }
      ]
    },
    { 
      id: 'spo2', 
      orderNo: 'SPO20250509002', 
      supplierName: '东莞模具中心', 
      orderDate: '2025-05-08', 
      summary: '轴承B加工 200个',
      items: [
        { id: 'spoi2', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', quantity: 200, receivedQty: 0, price: 15.0 }
      ]
    }
  ]
};


class DataStore {
  constructor(initialData) {
    this.state = { ...initialData };
    this.listeners = [];
  }

  get(entity) { return this.state[entity]; }

  set(entity, newValue) {
    this.state[entity] = newValue;
    this.notify(entity, newValue);
  }

  upsert(entity, item) {
    const list = Array.isArray(this.state[entity]) ? this.get(entity) : [];
    const index = list.findIndex(i => i.id === item.id);
    let newList;
    if (index > -1) {
      newList = [...list];
      newList[index] = { ...newList[index], ...item };
    } else {
      newList = [{ ...item, id: item.id || Date.now().toString() }, ...list];
    }
    this.set(entity, newList);
  }

  remove(entity, id) {
    const list = this.get(entity);
    this.set(entity, list.filter(i => i.id !== id));
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  notify(entity, data) {
    this.listeners.forEach(fn => fn(entity, data));
  }
}

export const mockData = new DataStore(initialState);

// React Hook for using the global mock data
export const useMockData = (entity) => {
  const [data, setData] = useState(mockData.get(entity));

  useEffect(() => {
    const unsubscribe = mockData.subscribe((changedEntity, newValue) => {
      if (changedEntity === entity) {
        setData(newValue);
      }
    });
    return unsubscribe;
  }, [entity]);

  return [data, (val) => mockData.set(entity, val)];
};

// Aliases for compatibility
export const employees = initialState.employees;
export const customers = initialState.customers;
export const products = initialState.products;
export const quotations = initialState.quotations;
export const normalOrders = initialState.normalOrders;
export const mockNormalOrders = initialState.normalOrders;
export const auditRecords = initialState.auditRecords;
export const mockAuditRecords = initialState.auditRecords;
export const auditLogs = [
  { id: 'al1', customerId: 'cus1', time: '2025-04-01 10:00:00', operator: '管理员', action: '创建客户', details: '系统初始化创建' },
  { id: 'al2', customerId: 'cus1', time: '2025-04-10 14:30:00', operator: '张经理', action: '修改基本信息', details: '更新联系人电话' },
  { id: 'al3', customerId: 'cus2', time: '2025-04-02 09:15:00', operator: '管理员', action: '创建客户', details: '手动录入' },
  { id: 'al4', customerId: 'cus4', time: '2025-04-05 11:00:00', operator: '张经理', action: '创建客户', details: '系统录入' },
  { id: 'al5', customerId: 'cus4', time: '2025-04-20 16:45:00', operator: '财务王', action: '变更结算信息', details: '结算方式变更为预存' },
  { id: 'al6', customerId: 'cus5', time: '2025-04-25 10:20:00', operator: '李仓库员', action: '创建客户', details: '待审批状态存入' },
  { id: 'al7', customerId: 'cus1', time: '2025-05-01 09:00:00', operator: '管理员', action: '变更业务员', details: '原业务员：张经理 -> 新业务员：管理员' }
];
export const salesOrders = initialState.normalOrders;
export const salespersonHistory = [
  { id: 'sph1', customerId: 'cus1', oldSalesperson: '张经理', newSalesperson: '管理员', operator: '管理员', createdAt: '2025-05-01 09:00:00' },
  { id: 'sph2', customerId: 'cus6', oldSalesperson: '李仓库员', newSalesperson: '管理员', operator: '管理员', createdAt: '2025-04-15 10:00:00' }
];
export const consignmentOrders = initialState.consignmentOrders;
export const mockExchanges = initialState.exchanges;
export const mockReplenishments = initialState.replenishments;
export const mockReturns = initialState.returns;
export const batchInbounds = initialState.inboundOrders.filter(o => o.type === '批量入库');
export const inventoryList = initialState.products;
export const deliveryNotices = initialState.deliveryNotices;
export const inboundOrders = initialState.inboundOrders;
export const purchaseOrders = initialState.inboundOrders.filter(o => o.type === '采购入库');
export const mockPurchaseOrders = purchaseOrders;
export const initialCustomers = initialState.customers;
export const consignmentInbounds = initialState.inboundOrders.filter(o => o.type === '受托入库');
export const stocks = initialState.products;
export const initialEstimations = initialState.estimations;
export const warehouses = initialState.warehouses;
export const subcontractPurchaseOrders = initialState.subcontractPurchaseOrders;
export const subcontractPurchases = initialState.subcontractPurchaseOrders;
export const initialBatchInbounds = batchInbounds;
export const initialConsignmentInbounds = consignmentInbounds;
export const initialSubcontractInbounds = initialState.inboundOrders.filter(o => o.type === '委外入库');
export const initialInbounds = initialState.inboundOrders;
export const inboundRecords = initialState.inboundOrders;
export const suppliers = initialState.suppliers;
export const batches = initialState.batches;
export const outboundOrders = initialState.outboundOrders;
export const productionFinishedOrders = initialState.normalOrders.filter(o => o.status === '已完工');
export const productCategories = [
    { id: 'pcat1', name: '成品' },
    { id: 'pcat2', name: '半成品' },
    { id: 'pcat3', name: '原材料' }
];
export const stocktakingRecords = [];
export const stocktakingTasks = initialState.stocktakingTasks;
export const materialFields = [
    { value: 'productName', label: '产品名称' },
    { value: 'productCode', label: '产品编码' },
    { value: 'spec', label: '规格' }
];
export const labelRules = initialState.labelRules;
export const mockLabelRules = initialState.labelRules;
export const materialBasicInfo = initialState.products.reduce((acc, p) => {
  acc[p.code] = {
    materialCode: p.code,
    materialName: p.name,
    ...p,
    createTime: '2025-04-01 10:00:00'
  };
  return acc;
}, {});
export const mockStockFlow = [
  { id: 'sf1', date: '2025-04-29', type: '销售出库', qty: -2, balance: 45, orderNo: 'OUT20250429001', productCode: 'PROD001' }
];
export const mockStockLedger = initialState.products.map(p => ({
  ...p,
  materialCode: p.code,
  materialName: p.name,
  currentQty: p.stock,
  totalStock: p.stock
}));
export const initialBankFlows = initialState.bankFlows;
export const bankAccounts = initialState.bankAccounts;
export const priceVersions = initialState.priceVersions;
export const customerCategories = [
    { id: 'cat1', name: '独立店', enabled: true },
    { id: 'cat2', name: '分销商', enabled: true },
    { id: 'cat3', name: '合伙人', enabled: true },
    { id: 'cat4', name: '直营店', enabled: true },
    { id: 'cat5', name: '企业客户', enabled: true },
    { id: 'cat6', name: '经销商', enabled: true },
    { id: 'cat7', name: '零售', enabled: true }
];
export const mockQuotations = quotations;
export const initialSizeRules = initialState.sizeRules;
export const rechargeOrders = initialState.recharges;
export const initialClaimRecords = initialState.claimRecords;
export const getDiscountRate = (type) => {
  const rates = {
    '独立店': 0,
    '分销商': 0.1,
    '合伙人': 0.15,
    '直营店': 0.05,
    '企业客户': 0.1,
    '经销商': 0.12,
    '零售': 0
  };
  return rates[type] || 0;
};
