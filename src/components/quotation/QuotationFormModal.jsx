import React, { useState, useEffect, useMemo } from 'react';
import { 
  Modal, Form, Row, Col, Input, DatePicker, Select, Switch, 
  InputNumber, Table, Button, Space, Typography, message, Divider, Tooltip, Descriptions, Badge, Steps, Radio, Tag
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined, InfoCircleOutlined, SwapOutlined,
  RightOutlined, CheckOutlined, LeftOutlined, ReloadOutlined, DownOutlined, BranchesOutlined,
  FolderOpenOutlined, FolderOutlined, CheckCircleFilled, TagOutlined, SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData, getDiscountRate } from '../../mock/data';
import CustomerSelectModal from './CustomerSelectModal';
import EstimationSelectModal from './EstimationSelectModal';
import PropertySelectModal from './PropertySelectModal';

const { TextArea } = Input;
const { Text, Title } = Typography;

// Helper to resolve pricing strategy discount & code
export const resolveStrategyForProduct = (customer, product, priceStrategies) => {
  if (!customer || !product) {
    return {
      discountRate: 1.0,
      strategyCode: '',
      strategyName: '未选择客户或产品',
      strategyObj: null
    };
  }

  const activeStrategies = priceStrategies || [];
  
  // 1. Check Product Specific Strategy (comma-separated productCodes)
  const productStrategy = activeStrategies.find(s => 
    (s.enabled ?? true) && 
    s.status === '生效' && 
    s.productInfo && 
    s.productInfo.split(',').map(c => c.trim()).some(c => c === product.code || c.split('/')[0] === product.code)
  );
  if (productStrategy) {
    return {
      discountRate: productStrategy.discountRate,
      strategyCode: productStrategy.code,
      strategyName: `产品特定策略 [${productStrategy.code}]`,
      strategyObj: productStrategy
    };
  }

  // 2. Check Customer Region Specific Strategy
  if (customer.region) {
    const regionStrategy = activeStrategies.find(s => 
      (s.enabled ?? true) && 
      s.status === '生效' && 
      s.customerRegion && 
      s.customerRegion.split('/').map(r => r.trim()).some(r => r === customer.region)
    );
    if (regionStrategy) {
      return {
        discountRate: regionStrategy.discountRate,
        strategyCode: regionStrategy.code,
        strategyName: `区域特定策略 [${regionStrategy.code}]`,
        strategyObj: regionStrategy
      };
    }
  }

  // 3. Check Customer Level Specific Strategy
  if (customer.level) {
    const levelStrategy = activeStrategies.find(s => 
      (s.enabled ?? true) && 
      s.status === '生效' && 
      s.customerLevel && 
      s.customerLevel === customer.level
    );
    if (levelStrategy) {
      return {
        discountRate: levelStrategy.discountRate,
        strategyCode: levelStrategy.code,
        strategyName: `等级特定策略 [${levelStrategy.code}]`,
        strategyObj: levelStrategy
      };
    }
  }

  // 4. Check Customer Category (Type) Specific Strategy
  if (customer.type) {
    const categoryStrategy = activeStrategies.find(s => 
      (s.enabled ?? true) && 
      s.status === '生效' && 
      s.customerCategory && 
      s.customerCategory === customer.type
    );
    if (categoryStrategy) {
      return {
        discountRate: categoryStrategy.discountRate,
        strategyCode: categoryStrategy.code,
        strategyName: `客户类型策略 [${categoryStrategy.code}]`,
        strategyObj: categoryStrategy
      };
    }
  }

  // Default fallback to customer's category base discount rate
  const defaultDiscount = getDiscountRate(customer.type);
  const discountFactor = 1 - defaultDiscount;
  return {
    discountRate: discountFactor,
    strategyCode: 'DEFAULT',
    strategyName: `默认客户类别折扣 (${(defaultDiscount * 100).toFixed(0)}% 优惠)`,
    strategyObj: {
      code: 'DEFAULT',
      customerCategory: customer.type || '不限',
      discountRate: discountFactor,
      effectiveDate: '长期有效',
      expiryDate: '长期有效',
      status: '生效'
    }
  };
};

const QuotationFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [products] = useMockData('products');
  const [employees] = useMockData('employees');
  const [priceStrategies] = useMockData('priceStrategiesLedger');

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [estimationModalOpen, setEstimationModalOpen] = useState(false);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);

  // Substitute selection states
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [activeItemForSubstitute, setActiveItemForSubstitute] = useState(null);
  const [tempSubstituteCode, setTempSubstituteCode] = useState(null);

  // Custom 3-Step Wizard state variables
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardActiveRowId, setWizardActiveRowId] = useState(null);
  const [wizardSearchCode, setWizardSearchCode] = useState('');
  const [wizardSearchName, setWizardSearchName] = useState('');
  const [wizardSelectedBaseProduct, setWizardSelectedBaseProduct] = useState(null);
  const [wizardSelectedAlternatives, setWizardSelectedAlternatives] = useState({});
  const [bomExpandedKeys, setBomExpandedKeys] = useState(['root', 'sub-1', 'sub-2']);
  const [wizardCustomCode, setWizardCustomCode] = useState('');
  const [wizardCustomName, setWizardCustomName] = useState('');

  // Strategy detail modal states
  const [strategyDetailModalOpen, setStrategyDetailModalOpen] = useState(false);
  const [selectedStrategyDetail, setSelectedStrategyDetail] = useState(null);

  const [currentEditingItem, setCurrentEditingItem] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [otherFees, setOtherFees] = useState(0);
  const [depositRate, setDepositRate] = useState(30);
  const [useDeposit, setUseDeposit] = useState(false);

  // Filter salable products
  const salableProducts = useMemo(() => products.filter(p => p.isSalable), [products]);

  // Handle Editing initialization
  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          quotationDate: dayjs(editingRecord.quotationDate),
          depositRate: (editingRecord.depositRate || 0.3) * 100,
          isDeposit: !!editingRecord.isDeposit,
          expectedDeliveryDate: editingRecord.expectedDeliveryDate ? dayjs(editingRecord.expectedDeliveryDate) : null,
          taxRate: editingRecord.taxRate ?? '13%',
          validityRange: editingRecord.validityRange ? [dayjs(editingRecord.validityRange[0]), dayjs(editingRecord.validityRange[1])] : null
        });

        const activeCustomer = {
          id: editingRecord.customerId,
          code: editingRecord.customerCode,
          name: editingRecord.customerName,
          type: editingRecord.customerType || '经销商',
          level: editingRecord.customerLevel || 'B级',
          region: editingRecord.customerRegion || '华南',
          discountRate: editingRecord.discountRate || 0
        };
        setSelectedCustomer(activeCustomer);

        // Map items backward-compatibly
        const loadedItems = (editingRecord.items || []).map(item => {
          const product = salableProducts.find(p => p.code === item.productCode);
          const prObj = product || { code: item.productCode, price: item.standardPrice || item.unitPrice || 0 };
          const strategyResult = resolveStrategyForProduct(activeCustomer, prObj, priceStrategies);

          const totalStock = products.filter(p => p.code === prObj.code).reduce((sum, p) => sum + (p.stock || 0), 0);
          const occupiedQty = prObj.occupiedQty || 0;
          const availableQty = totalStock - occupiedQty;

          const standardPrice = item.standardPrice || item.unitPrice || prObj.price || 0;
          const discountRate = item.discountRate !== undefined ? item.discountRate : strategyResult.discountRate;
          const finalPrice = item.finalPrice || (standardPrice * discountRate);

          return {
            ...item,
            id: item.id || Date.now().toString() + Math.random(),
            productCode: item.productCode,
            productName: item.productName,
            isCustom: item.isCustom ?? false,
            tempProductCode: item.tempProductCode || (item.isCustom ? `LS-${dayjs().format('YYMM')}${Math.floor(100 + Math.random() * 900)}` : ''),
            substituteProductCode: item.substituteProductCode || '',
            substituteProductName: item.substituteProductName || '',
            substituteSpec: item.substituteSpec || '',
            spec: item.spec || prObj.spec || '',
            model: item.model || prObj.category || 'M-2026',
            category: item.category || prObj.category || '成品',
            unit: item.unit || prObj.unit || '个',
            stockQty: totalStock,
            availableQty: availableQty,
            standardPrice,
            marketPrice: item.marketPrice || standardPrice * 1.2,
            floorPrice: item.floorPrice || standardPrice * 0.8,
            discountRate,
            strategyCode: item.strategyCode || strategyResult.strategyCode,
            finalPrice,
            quantity: item.quantity || 1,
            amount: finalPrice * (item.quantity || 1),
            remark: item.remark || ''
          };
        });

        setItems(loadedItems);
        setOtherFees(editingRecord.otherFees || 0);
        setUseDeposit(!!editingRecord.isDeposit);
        setDepositRate((editingRecord.depositRate || 0.3) * 100);
      } else {
        const nextNo = `BJ-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        form.setFieldsValue({
          quotationNo: nextNo,
          quotationDate: dayjs(),
          salesperson: '当前用户',
          depositRate: 30,
          isDeposit: false,
          expectedDeliveryDate: null,
          taxRate: '13%',
          validityRange: null
        });
        setSelectedCustomer(null);
        setItems([]);
        setOtherFees(0);
        setUseDeposit(false);
        setDepositRate(30);
      }
    }
  }, [open, editingRecord, form, priceStrategies, products, salableProducts]);

  // Recalculate item strategies if customer changes
  useEffect(() => {
    if (selectedCustomer && items.length > 0) {
      const updatedItems = items.map(item => {
        const product = salableProducts.find(p => p.code === item.productCode);
        if (product) {
          const strategyResult = resolveStrategyForProduct(selectedCustomer, product, priceStrategies);
          const finalPrice = (item.standardPrice || 0) * strategyResult.discountRate;
          return {
            ...item,
            discountRate: strategyResult.discountRate,
            strategyCode: strategyResult.strategyCode,
            finalPrice,
            amount: finalPrice * (item.quantity || 1)
          };
        }
        return item;
      });

      const hasChanged = JSON.stringify(items.map(i => ({ d: i.discountRate, s: i.strategyCode }))) !== JSON.stringify(updatedItems.map(i => ({ d: i.discountRate, s: i.strategyCode })));
      if (hasChanged) {
        setItems(updatedItems);
      }
    }
  }, [selectedCustomer, priceStrategies, items, salableProducts]);

  const taxRateStr = Form.useWatch('taxRate', form);

  const taxRate = useMemo(() => {
    if (!taxRateStr) return 0.13; // default fallback if empty
    const clean = String(taxRateStr).replace('%', '').trim();
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    return num > 1 ? num / 100 : num;
  }, [taxRateStr]);

  // Calculations
  const calculations = useMemo(() => {
    // 产品总额 = 所有产品的标准单价 × 数量 之和
    const productTotal = items.reduce((acc, curr) => acc + ((curr.standardPrice || 0) * (curr.quantity || 0)), 0);
    // 产品折后总额 = 所有产品的折后单价 × 数量 之和
    const discountedTotal = items.reduce((acc, curr) => acc + ((curr.finalPrice || 0) * (curr.quantity || 0)), 0);
    // 优惠金额 = 产品总额 - 产品折后总额
    const saving = productTotal - discountedTotal;
    // 产品含税总额 = 产品折后总额 * (1 + taxRate)
    const taxedProductTotal = discountedTotal * (1 + taxRate);
    // 报价总额 = 产品含税总额 + 其他费用
    const totalAmount = taxedProductTotal + otherFees;
    // 定金应收 = 报价总额 * 定金比例(%)
    const depositAmount = useDeposit ? totalAmount * (depositRate / 100) : 0;

    return {
      productTotal,
      discountedTotal,
      saving,
      taxedProductTotal,
      totalAmount,
      depositAmount
    };
  }, [items, taxRate, otherFees, useDeposit, depositRate]);

  const handleAddStandardItem = () => {
    const newItem = {
      id: 'std_' + Date.now().toString() + Math.random(),
      productCode: '',
      productName: '',
      isCustom: false,
      spec: '',
      model: '',
      category: '成品',
      stockQty: 0,
      availableQty: 0,
      standardPrice: 0,
      marketPrice: 0,
      floorPrice: 0,
      discountRate: 1.0,
      strategyCode: '',
      finalPrice: 0,
      quantity: 1,
      amount: 0,
      remark: ''
    };
    setItems([...items, newItem]);
  };

  const handleAddCustomItem = () => {
    setWizardActiveRowId('new_custom');
    setWizardStep(0);
    setWizardSearchCode('');
    setWizardSearchName('');
    setWizardSelectedBaseProduct(null);
    setWizardSelectedAlternatives({});
    setSubstituteModalOpen(true);
  };

  useEffect(() => {
    if (wizardSelectedBaseProduct) {
      const serialNum = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
      setWizardCustomCode(`${wizardSelectedBaseProduct.code}-CUST-${serialNum}`);
      setWizardCustomName(`${wizardSelectedBaseProduct.name}—定制${serialNum}`);
      
      const relations = getBOMRelations(wizardSelectedBaseProduct);
      if (relations) {
        // Expand all by default
        const nodeKeys = [];
        const collect = (node) => {
          nodeKeys.push(node.id || node.code);
          if (node.children) {
            node.children.forEach(collect);
          }
        };
        collect(relations);
        setBomExpandedKeys(nodeKeys);
      }
    } else {
      setWizardCustomCode('');
      setWizardCustomName('');
    }
  }, [wizardSelectedBaseProduct]);

  const getBOMLevelsForProduct = (product) => {
    if (!product) return [];
    if (product.code === 'PROD001' || product.name.includes('沙发')) {
      return [
        {
          key: 'level-1',
          title: '第1层：包覆皮面皮料（单选）',
          children: [
            { key: 'alt-1-1', code: 'RAW002', name: '木材B', spec: '进口红橡木加强实木骨架', diffPrice: 120 },
            { key: 'alt-1-2', code: 'RAW003', name: '木材C', spec: '德国原装黑胡桃奢华骨架', diffPrice: 280 }
          ]
        },
        {
          key: 'level-2',
          title: '第2层：外包格外面饰面料（单选）',
          children: [
            { key: 'alt-2-1', code: 'RAW006', name: '皮料A', spec: '超纤耐磨哑光抗污皮革', diffPrice: 800 },
            { key: 'alt-2-2', code: 'RAW007', name: '皮料B', spec: '意大利黄牛皮头层复古皮', diffPrice: 1150 }
          ]
        }
      ];
    }
    if (product.code === 'PROD002' || product.name.includes('餐桌')) {
      return [
        {
          key: 'level-1',
          title: '第1层：精选桌面板材饰面（单选）',
          children: [
            { key: 'alt-t1-1', code: 'MAT-201', name: '北美FAS级白蜡实木直拼板', spec: '优质白蜡实木3.0cm厚', diffPrice: 300 },
            { key: 'alt-t1-2', code: 'MAT-202', name: '精选级红橡原生态木质板', spec: '北美红橡无疤拼板 3.0cm厚', diffPrice: 500 },
            { key: 'alt-t1-3', code: 'MAT-203', name: '大理石原矿抗菌防污岩板', spec: '1.2cm进口晶面大理石岩板', diffPrice: 1600 }
          ]
        },
        {
          key: 'level-2',
          title: '第2层：支撑托架五金结构（单选）',
          children: [
            { key: 'alt-t2-1', code: 'MAT-206', name: '轻奢拉丝全钛金托架', spec: '钛金高贵镜面抛光工艺', diffPrice: 450 },
            { key: 'alt-t2-2', code: 'MAT-207', name: '硬质加强合金防锈托架', spec: '抗压悬挂拉伸焊接托梁', diffPrice: 850 }
          ]
        }
      ];
    }
    return [
      {
        key: 'level-1',
        title: '第1层：柜体背板选用主材（单选）',
        children: [
          { key: 'alt-d1-1', code: 'MAT-301', name: 'E0级万华禾香生态颗粒板', spec: '莫兰迪免漆耐磨饰面 E0级', diffPrice: 120 },
          { key: 'alt-d1-2', code: 'MAT-302', name: '北美特级原切白蜡直拼板', spec: '2.5cm白蜡实木双面清油', diffPrice: 850 }
        ]
      },
      {
        key: 'level-2',
        title: '第2层：关键合页阻尼铰链（单选）',
        children: [
          { key: 'alt-d2-1', code: 'MAT-305', name: '海蒂诗Sensys液压铰链', spec: 'BLUM一键阻尼微调不锈钢活塞', diffPrice: 100 },
          { key: 'alt-d2-2', code: 'MAT-306', name: '奥地利GRASS一键阻尼铰链', spec: '高纯度承重全钢消音气压滑轨', diffPrice: 240 }
        ]
      }
    ];
  };

  const getBOMRelations = (product) => {
    if (!product) return null;
    if (product.code === 'PROD001' || product.name.includes('沙发')) {
      return {
        id: 'root',
        name: product.name,
        code: product.code,
        category: '成品',
        unitQty: '1台',
        children: [
          {
            id: 'sub-1',
            name: '沙发架',
            code: 'MB001',
            category: '半成品',
            unitQty: '1个',
            children: [
              {
                id: 'raw-1',
                name: '木材A',
                code: 'RAW001',
                category: '原材料',
                unitQty: '5m',
                levelKey: 'level-1',
                alternatives: [
                  { key: 'alt-1-1', code: 'RAW002', name: '木材B', diffPrice: 120 },
                  { key: 'alt-1-2', code: 'RAW003', name: '木材C', diffPrice: 280 }
                ]
              },
              {
                id: 'raw-2',
                name: '面料',
                code: 'RAW005',
                category: '原材料',
                unitQty: '2m',
                levelKey: 'level-2',
                alternatives: [
                  { key: 'alt-2-1', code: 'RAW006', name: '皮料A', diffPrice: 800 },
                  { key: 'alt-2-2', code: 'RAW007', name: '皮料B', diffPrice: 1150 }
                ]
              }
            ]
          }
        ]
      };
    }
    
    if (product.code === 'PROD002' || product.name.includes('餐桌')) {
      return {
        id: 'root',
        name: product.name,
        code: product.code,
        category: '成品',
        unitQty: '1张',
        children: [
          {
            id: 'sub-1',
            name: '大理石餐桌台面',
            code: 'TZ001',
            category: '半成品',
            unitQty: '1件',
            children: [
              {
                id: 'raw-1',
                name: '饰面大理石料',
                code: 'RAW101',
                category: '原材料',
                unitQty: '1块',
                levelKey: 'level-1',
                alternatives: [
                  { key: 'alt-t1-1', code: 'MAT-201', name: '北美FAS级白蜡实木直拼板', diffPrice: 300 },
                  { key: 'alt-t1-2', code: 'MAT-202', name: '精选北美级红橡原生态木质板', diffPrice: 500 },
                  { key: 'alt-t1-3', code: 'MAT-203', name: '意大利奢华山脉雪山大理石原矿岩板', diffPrice: 1600 }
                ]
              }
            ]
          },
          {
            id: 'sub-2',
            name: '餐桌承载托架',
            code: 'TZ002',
            category: '半成品',
            unitQty: '1套',
            children: [
              {
                id: 'raw-2',
                name: '支撑钢架管件',
                code: 'RAW105',
                category: '原材料',
                unitQty: '4根',
                levelKey: 'level-2',
                alternatives: [
                  { key: 'alt-t2-1', code: 'MAT-206', name: '轻奢拉丝全钛金托架', diffPrice: 450 },
                  { key: 'alt-t2-2', code: 'MAT-207', name: '硬质加强合金防锈托架', diffPrice: 850 }
                ]
              }
            ]
          }
        ]
      };
    }

    return {
      id: 'root',
      name: product.name,
      code: product.code,
      category: '成品',
      unitQty: '1套',
      children: [
        {
          id: 'sub-1',
          name: '主架框架拼合',
          code: 'JX001',
          category: '半成品',
          unitQty: '1组',
          children: [
            {
              id: 'raw-1',
              name: '背层饰面贴板',
              code: 'RAW201',
              category: '原材料',
              unitQty: '4㎡',
              levelKey: 'level-1',
              alternatives: [
                { key: 'alt-d1-1', code: 'MAT-301', name: 'E0万华禾香生态颗粒板', diffPrice: 120 },
                { key: 'alt-d1-2', code: 'MAT-302', name: '原木白蜡黑胡桃直拼板', diffPrice: 850 }
              ]
            }
          ]
        },
        {
          id: 'sub-2',
          name: '主架阻尼五金',
          code: 'JX002',
          category: '半成品',
          unitQty: '1盒',
          children: [
            {
              id: 'raw-2',
              name: '阻尼拉合铰链',
              code: 'RAW205',
              category: '原材料',
              unitQty: '8孔',
              levelKey: 'level-2',
              alternatives: [
                { key: 'alt-d2-1', code: 'MAT-305', name: '海蒂诗Sensys液压静音铰链', diffPrice: 100 },
                { key: 'alt-d2-2', code: 'MAT-306', name: 'DTC自闭阻尼隐藏底部滑轨', diffPrice: 40 }
              ]
            }
          ]
        }
      ]
    };
  };

  const openSubstituteWizard = (record) => {
    setWizardActiveRowId(record.id);
    setWizardStep(0);
    setWizardSearchCode('');
    setWizardSearchName('');
    
    // Attempt to parse existing substitute or start fresh
    let matchedBaseProduct = null;
    if (record.productCode) {
      const baseCode = record.productCode.split('-')[0];
      matchedBaseProduct = salableProducts.find(p => p.code === baseCode);
    }
    
    if (!matchedBaseProduct && record.productName) {
      const cleanName = record.productName.replace('定制-', '');
      matchedBaseProduct = salableProducts.find(p => p.name === cleanName || cleanName.includes(p.name));
    }
    
    setWizardSelectedBaseProduct(matchedBaseProduct);
    
    const alts = {};
    if (record.substituteProductCode && matchedBaseProduct) {
      const codes = record.substituteProductCode.split(',');
      const bomLevels = getBOMLevelsForProduct(matchedBaseProduct);
      bomLevels.forEach(lvl => {
        lvl.children.forEach(child => {
          if (codes.includes(child.code)) {
            alts[lvl.key] = child.key;
          }
        });
      });
    }
    setWizardSelectedAlternatives(alts);
    setSubstituteModalOpen(true);
  };

  const handleWizardConfirm = () => {
    if (!wizardSelectedBaseProduct) {
      message.warning('请确保选择了主标品');
      return;
    }

    const levels = getBOMLevelsForProduct(wizardSelectedBaseProduct);
    const selectedAltsList = [];
    let priceDiffSum = 0;

    levels.forEach(lvl => {
      const selectedKey = wizardSelectedAlternatives[lvl.key];
      const matchedOption = lvl.children.find(child => child.key === selectedKey);
      if (matchedOption) {
        selectedAltsList.push(matchedOption);
        priceDiffSum += matchedOption.diffPrice;
      }
    });

    const finalStandardPrice = (wizardSelectedBaseProduct.price || 0) + priceDiffSum;
    const descSubstituteDetails = selectedAltsList.map(a => `${a.name}(${a.code})[差:¥${a.diffPrice}]`).join('; ');
    const descSpec = `${wizardSelectedBaseProduct.spec} (定制替代: ${selectedAltsList.map(a => `${a.name}[${a.spec}]`).join(', ')})`;
    
    const customCode = wizardCustomCode || `${wizardSelectedBaseProduct.code}-CUST-${Math.floor(100 + Math.random() * 900)}`;
    const customName = wizardCustomName || `定制-${wizardSelectedBaseProduct.name}`;

    const strategyResult = resolveStrategyForProduct(selectedCustomer, { code: wizardSelectedBaseProduct.code, price: finalStandardPrice }, priceStrategies);
    
    const totalStock = products.filter(p => p.code === wizardSelectedBaseProduct.code).reduce((sum, p) => sum + (p.stock || 0), 0);
    const occupiedQty = wizardSelectedBaseProduct.occupiedQty || 0;
    const availableQty = totalStock - occupiedQty;
    const finalPrice = finalStandardPrice * strategyResult.discountRate;

    if (wizardActiveRowId === 'new_custom') {
      const newItem = {
        id: 'cust_' + Date.now().toString() + Math.random(),
        productCode: customCode,
        productName: customName,
        isCustom: true,
        tempProductCode: customCode,
        spec: descSpec,
        model: wizardSelectedBaseProduct.category || 'M-2026-LS',
        category: '定制成品',
        unit: wizardSelectedBaseProduct.unit || '个',
        stockQty: totalStock,
        availableQty: availableQty,
        standardPrice: finalStandardPrice,
        marketPrice: finalStandardPrice * 1.2,
        floorPrice: finalStandardPrice * 0.8,
        discountRate: strategyResult.discountRate,
        strategyCode: strategyResult.strategyCode,
        finalPrice: finalPrice,
        quantity: 1,
        amount: finalPrice * 1,
        remark: '',
        substituteProductCode: selectedAltsList.map(a => a.code).join(','),
        substituteProductName: selectedAltsList.map(a => a.name).join(','),
        substituteSpec: descSubstituteDetails
      };
      setItems([...items, newItem]);
    } else {
      const updatedItems = items.map(item => {
        if (item.id === wizardActiveRowId) {
          return {
            ...item,
            productCode: customCode,
            productName: customName,
            tempProductCode: customCode,
            spec: descSpec,
            model: wizardSelectedBaseProduct.category || 'M-2026-LS',
            category: '定制成品',
            unit: wizardSelectedBaseProduct.unit || '个',
            stockQty: totalStock,
            availableQty: availableQty,
            standardPrice: finalStandardPrice,
            marketPrice: finalStandardPrice * 1.2,
            floorPrice: finalStandardPrice * 0.8,
            discountRate: strategyResult.discountRate,
            strategyCode: strategyResult.strategyCode,
            finalPrice: finalPrice,
            amount: finalPrice * (item.quantity || 1),
            substituteProductCode: selectedAltsList.map(a => a.code).join(','),
            substituteProductName: selectedAltsList.map(a => a.name).join(','),
            substituteSpec: descSubstituteDetails
          };
        }
        return item;
      });
      setItems(updatedItems);
    }

    setSubstituteModalOpen(false);
    message.success('替代料和BOM层级成功配置，数据已回填！');
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        
        if (field === 'productCode' || field === 'productName') {
          const product = salableProducts.find(p => p.code === value || p.name === value);
          if (product) {
            const totalStock = products.filter(p => p.code === product.code).reduce((sum, p) => sum + (p.stock || 0), 0);
            const occupiedQty = product.occupiedQty || 0;
            const availableQty = totalStock - occupiedQty;

            updated = {
              ...updated,
              productCode: product.code,
              productName: product.name,
              spec: product.spec,
              model: product.category || 'M-2026',
              category: product.category || '成品',
              unit: product.unit || '个',
              standardPrice: product.price || 0,
              marketPrice: product.price ? product.price * 1.2 : 0,
              floorPrice: product.price ? product.price * 0.8 : 0,
              unitPrice: product.price || 0,
              stockQty: totalStock,
              availableQty: availableQty,
            };
          }
        }
        
        if (field === 'isCustom') {
          if (value === true) {
            updated.tempProductCode = `LS-${dayjs().format('YYMM')}${Math.floor(100 + Math.random() * 900)}`;
          } else {
            updated.tempProductCode = '';
            updated.substituteProductCode = '';
            updated.substituteProductName = '';
            updated.substituteSpec = '';
          }
        }

        // Re-evaluate strategy values
        const currentPrd = { code: updated.productCode, price: updated.standardPrice };
        const strategyResult = resolveStrategyForProduct(selectedCustomer, currentPrd, priceStrategies);
        
        updated.discountRate = strategyResult.discountRate;
        updated.strategyCode = strategyResult.strategyCode;
        updated.finalPrice = (updated.standardPrice || 0) * strategyResult.discountRate;
        updated.amount = updated.finalPrice * (updated.quantity || 1);
        
        return updated;
      }
      return item;
    });
    setItems(newItems);
  };

  const handleSaveDraft = (isSubmit = false) => {
    form.validateFields().then(values => {
      if (!selectedCustomer) {
        message.warning('请选择一个客户');
        return;
      }
      if (items.length === 0) {
        message.warning('请至少添加一个产品');
        return;
      }
      
      const invalidItem = items.find(i => i.finalPrice < i.floorPrice);
      if (invalidItem) {
        message.warning(`产品 [${invalidItem.productName}] 的折后单价低于底价 ¥${invalidItem.floorPrice}`);
      }

      const quotationData = {
        ...values,
        id: editingRecord?.id,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerCode: selectedCustomer.code,
        customerType: selectedCustomer.type,
        customerLevel: selectedCustomer.level,
        customerRegion: selectedCustomer.region,
        discountRate: calculations.discountedTotal / (calculations.productTotal || 1),
        hasCustomProduct: items.some(i => i.isCustom),
        items,
        totalAmount: calculations.totalAmount,
        otherFees,
        depositAmount: calculations.depositAmount,
        isDeposit: values.isDeposit,
        depositRate: values.isDeposit ? (values.depositRate / 100) : 0,
        status: isSubmit ? '待审批' : '草稿',
        quotationDate: values.quotationDate.format('YYYY-MM-DD'),
        expectedDeliveryDate: values.expectedDeliveryDate ? values.expectedDeliveryDate.format('YYYY-MM-DD') : null,
        validityRange: values.validityRange ? [
          values.validityRange[0].format('YYYY-MM-DD'),
          values.validityRange[1].format('YYYY-MM-DD')
        ] : null
      };
      
      onSave(quotationData);
      onCancel();
    });
  };

  const handleViewStrategyDetail = (strategyCode) => {
    if (!strategyCode) return;
    const found = priceStrategies.find(s => s.code === strategyCode);
    if (found) {
      setSelectedStrategyDetail(found);
      setStrategyDetailModalOpen(true);
    } else if (strategyCode === 'DEFAULT') {
      setSelectedStrategyDetail({
        code: '默认客户类别折扣',
        customerCategory: selectedCustomer?.type || '通配类别',
        discountRate: 1 - getDiscountRate(selectedCustomer?.type),
        effectiveDate: '长期有效',
        expiryDate: '长期有效',
        status: '生效',
        operator: '系统'
      });
      setStrategyDetailModalOpen(true);
    } else {
      message.info('无相关价格策略');
    }
  };

  const standardColumns = [
    { 
      title: '序号', 
      width: 50, 
      align: 'center',
      fixed: 'left',
      render: (_, __, i) => i + 1 
    },
    {
      title: '产品编码',
      width: 140,
      fixed: 'left',
      render: (_, record) => (
        <Select
          showSearch
          placeholder="搜索编码"
          style={{ width: '100%' }}
          value={record.productCode || undefined}
          onChange={(val) => handleItemChange(record.id, 'productCode', val)}
          options={salableProducts.map(p => ({ value: p.code, label: p.code }))}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      )
    },
    {
      title: '产品名称',
      width: 160,
      render: (_, record) => (
        <Select
          showSearch
          placeholder="搜索名称"
          style={{ width: '100%' }}
          value={record.productCode || undefined}
          onChange={(val) => handleItemChange(record.id, 'productCode', val)}
          options={salableProducts.map(p => ({ value: p.code, label: p.name }))}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      )
    },
    { 
      title: '规格', 
      dataIndex: 'spec', 
      width: 120, 
      ellipsis: true,
      render: (text) => <span className="text-gray-600 text-xs">{text || '-'}</span>
    },
    { 
      title: '型号', 
      dataIndex: 'model', 
      width: 100, 
      ellipsis: true,
      render: (text) => <span className="text-gray-600 text-xs">{text || '-'}</span>
    },
    { 
      title: '单位', 
      dataIndex: 'unit', 
      width: 70, 
      align: 'center',
      render: (text) => <span className="text-gray-600">{text || '个'}</span>
    },
    { 
      title: '产品类型', 
      dataIndex: 'category', 
      width: 100, 
      align: 'center',
      render: (val) => {
        const v = val || '成品';
        const colorMap = {
          '定制成品': 'purple',
          '成品': 'blue',
          '半成品': 'orange',
          '原材料': 'green',
          '配件': 'cyan'
        };
        return (
          <Tag color={colorMap[v] || 'blue'} className="m-0 border-none px-2 py-0.5 rounded font-medium text-[11px]">
            {v}
          </Tag>
        );
      }
    },
    { 
      title: '库存数量', 
      dataIndex: 'stockQty', 
      width: 80, 
      align: 'right',
      render: (v) => <span className="font-mono text-gray-700">{v ?? 0}</span>
    },
    { 
      title: '可用数量',
      dataIndex: 'availableQty', 
      width: 100, 
      align: 'right',
      render: (v) => <span className="font-mono text-blue-600 font-medium">{v ?? 0}</span>
    },
    { 
      title: '占用数量', 
      width: 80, 
      align: 'right',
      render: (_, record) => {
        const stock = record.stockQty ?? 0;
        const available = record.availableQty ?? 0;
        const occupied = Math.max(0, stock - available);
        return <span className="font-mono text-amber-600 font-medium">{occupied}</span>;
      }
    },
    { 
      title: '标准单价', 
      dataIndex: 'standardPrice', 
      width: 100, 
      align: 'right', 
      render: (v) => <span className="font-mono text-gray-700">¥{(v || 0).toFixed(2)}</span>
    },
    { 
      title: '市场指导价', 
      dataIndex: 'marketPrice', 
      width: 100, 
      align: 'right', 
      render: (v) => <span className="font-mono text-gray-400">¥{(v || 0).toFixed(2)}</span>
    },
    { 
      title: '底价', 
      dataIndex: 'floorPrice', 
      width: 90, 
      align: 'right', 
      render: (v) => <span className="font-mono text-gray-500">¥{(v || 0).toFixed(2)}</span>
    },
    { 
      title: '优惠折扣率', 
      dataIndex: 'discountRate', 
      width: 80, 
      align: 'center',
      render: (factor) => <span className="font-medium text-purple-600">{(factor || 1).toFixed(2)}</span>
    },
    { 
      title: '价格策略', 
      dataIndex: 'strategyCode', 
      width: 110, 
      align: 'center',
      render: (code, record) => {
        if (!code) return <span className="text-gray-400">-</span>;
        return (
          <Button 
            type="link" 
            size="small" 
            style={{ fontSize: '11px', padding: 0 }}
            onClick={() => handleViewStrategyDetail(code)}
          >
            {code}
          </Button>
        );
      }
    },
    { 
      title: '折后单价',
      dataIndex: 'finalPrice', 
      width: 110, 
      align: 'right', 
      render: (v) => <strong className="font-mono text-gray-900">¥{(v || 0).toFixed(2)}</strong>
    },
    {
      title: '数量',
      width: 85,
      render: (_, record) => (
        <InputNumber 
          min={1} 
          value={record.quantity || 1} 
          onChange={(val) => handleItemChange(record.id, 'quantity', val)} 
          style={{ width: '100%' }}
        />
      )
    },
    { 
      title: '标准总金额', 
      width: 110, 
      align: 'right', 
      render: (_, record) => {
        const stdTotal = (record.standardPrice || 0) * (record.quantity || 1);
        return <span className="font-mono text-gray-600">¥{stdTotal.toFixed(2)}</span>;
      }
    },
    { 
      title: '折后金额（不含税）', 
      dataIndex: 'amount', 
      width: 130, 
      align: 'right', 
      render: (v) => <strong className="font-mono text-amber-600">¥{(v || 0).toFixed(2)}</strong>
    },
    {
      title: '折后金额（含税）',
      width: 130,
      align: 'right',
      render: (_, record) => {
        const amt = (record.finalPrice || 0) * (record.quantity || 1);
        const taxedAmt = amt * (1 + taxRate);
        return <strong className="font-mono text-amber-600">¥{taxedAmt.toFixed(2)}</strong>;
      }
    },
    {
      title: '备注',
      width: 120,
      render: (_, record) => (
        <Input 
          placeholder="备注" 
          value={record.remark || ''} 
          onChange={(e) => handleItemChange(record.id, 'remark', e.target.value)} 
          style={{ fontSize: '11px' }}
        />
      )
    },
    {
      title: '操作',
      width: 50,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          size="small"
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveItem(record.id)} 
        />
      )
    }
  ];

  const customColumns = [
    { 
      title: '序号', 
      width: 50, 
      align: 'center',
      fixed: 'left',
      render: (_, __, i) => i + 1 
    },
    {
      title: '定制品编码',
      width: 150,
      fixed: 'left',
      render: (_, record) => (
        <Input 
          placeholder="定制编码" 
          value={record.productCode || record.tempProductCode || ''} 
          onChange={(e) => handleItemChange(record.id, 'productCode', e.target.value)} 
          style={{ fontSize: '11px' }}
          disabled={!!record.productCode}
        />
      )
    },
    {
      title: '定制品名称',
      width: 160,
      render: (_, record) => (
        <Input 
          placeholder="定制名称" 
          value={record.productName || ''} 
          onChange={(e) => handleItemChange(record.id, 'productName', e.target.value)} 
          style={{ fontSize: '11px' }}
          disabled={!!record.productCode}
        />
      )
    },
    { 
      title: '规格', 
      width: 200, 
      render: (_, record) => (
        <Input 
          placeholder="定制规格说明" 
          value={record.spec || ''} 
          onChange={(e) => handleItemChange(record.id, 'spec', e.target.value)} 
          style={{ fontSize: '11px' }}
          disabled={!!record.productCode}
        />
      )
    },
    { 
      title: '型号', 
      width: 110, 
      render: (_, record) => (
        <Input 
          placeholder="定制型号" 
          value={record.model || ''} 
          onChange={(e) => handleItemChange(record.id, 'model', e.target.value)} 
          style={{ fontSize: '11px' }}
          disabled={!!record.productCode}
        />
      )
    },
    { 
      title: '单位', 
      width: 80, 
      render: (_, record) => (
        <Input 
          placeholder="单位" 
          value={record.unit || '个'} 
          onChange={(e) => handleItemChange(record.id, 'unit', e.target.value)} 
          style={{ fontSize: '11px' }}
          disabled={!!record.productCode}
        />
      )
    },
    {
      title: '替代料明细',
      width: 220,
      render: (_, record) => {
        const hasSubstitute = !!record.substituteProductCode;
        const codes = record.substituteProductCode ? record.substituteProductCode.split(',') : [];
        const names = record.substituteProductName ? record.substituteProductName.split(',') : [];
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            {!hasSubstitute && (
              <Button 
                type="primary" 
                size="small" 
                icon={<SwapOutlined />}
                onClick={() => openSubstituteWizard(record)}
                style={{ fontSize: '11px', width: '100%' }}
                disabled={!!record.productCode}
              >
                选择替代料
              </Button>
            )}
            {hasSubstitute ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className="w-full">
                {codes.map((code, idx) => (
                  <div 
                    key={code} 
                    className="flex flex-col gap-0.5 px-2 py-1 bg-amber-50/65 border border-amber-100 rounded text-[10px] text-amber-700 font-medium leading-tight"
                    style={{ borderLeft: '3px solid #d97706' }}
                  >
                    <div className="flex items-center gap-1 w-full justify-between border-b border-amber-100/30 pb-0.5 mb-0.5">
                      <span className="font-semibold text-amber-800 flex items-center gap-1">
                        <SwapOutlined style={{ fontSize: '10px' }} className="text-amber-600 shrink-0" />
                        {names[idx] || '替代项'}
                      </span>
                    </div>
                    <span className="font-mono text-gray-400 scale-90 origin-left">({code})</span>
                  </div>
                ))}
                {record.substituteSpec && (
                  <div className="text-[9px] text-gray-400 px-1 mt-0.5 leading-snug" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                    详情: {record.substituteSpec}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-xs block text-center py-1">暂无替代配置</span>
            )}
          </Space>
        );
      }
    },
    { 
      title: '产品类型', 
      width: 120, 
      align: 'center',
      render: (_, record) => {
        if (!!record.productCode) {
          const val = record.category || '定制成品';
          const colorMap = {
            '定制成品': 'purple',
            '成品': 'blue',
            '半成品': 'orange',
            '原材料': 'green',
            '配件': 'cyan'
          };
          return (
            <Tag color={colorMap[val] || 'purple'} className="m-0 border-none px-2.5 py-0.5 rounded font-medium text-xs">
              {val}
            </Tag>
          );
        }
        return (
          <Select
            style={{ width: '100%', fontSize: '11px' }}
            value={record.category || '定制成品'}
            onChange={(val) => handleItemChange(record.id, 'category', val)}
            options={[
              { value: '定制成品', label: '定制成品' },
              { value: '成品', label: '标准成品' },
              { value: '配件', label: '配件物料' }
            ]}
          />
        );
      }
    },
    { 
      title: '库存数量', 
      dataIndex: 'stockQty', 
      width: 80, 
      align: 'right',
      render: (v) => <span className="font-mono text-gray-700">{v ?? 0}</span>
    },
    { 
      title: '可用数量',
      dataIndex: 'availableQty', 
      width: 100, 
      align: 'right',
      render: (v) => <span className="font-mono text-blue-600 font-medium">{v ?? 0}</span>
    },
    { 
      title: '占用数量', 
      width: 80, 
      align: 'right',
      render: (_, record) => {
        const stock = record.stockQty ?? 0;
        const available = record.availableQty ?? 0;
        const occupied = Math.max(0, stock - available);
        return <span className="font-mono text-amber-600 font-medium">{occupied}</span>;
      }
    },
    { 
      title: '标准单价', 
      width: 120, 
      align: 'right', 
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.standardPrice || 0}
          onChange={(val) => handleItemChange(record.id, 'standardPrice', val || 0)}
          style={{ width: '100%', fontSize: '11px' }}
          formatter={value => `¥ ${value}`}
          parser={value => value.replace('¥ ', '')}
          disabled={!!record.productCode}
        />
      )
    },
    { 
      title: '市场指导价', 
      width: 110, 
      align: 'right', 
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.marketPrice || 0}
          onChange={(val) => handleItemChange(record.id, 'marketPrice', val || 0)}
          style={{ width: '100%', fontSize: '11px' }}
          disabled={!!record.productCode}
        />
      )
    },
    { 
      title: '底价', 
      width: 110, 
      align: 'right', 
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.floorPrice || 0}
          onChange={(val) => handleItemChange(record.id, 'floorPrice', val || 0)}
          style={{ width: '100%', fontSize: '11px' }}
          disabled={!!record.productCode}
        />
      )
    },
    { 
      title: '优惠折扣率', 
      dataIndex: 'discountRate', 
      width: 80, 
      align: 'center',
      render: (factor) => <span className="font-medium text-purple-600">{(factor || 1).toFixed(2)}</span>
    },
    { 
      title: '价格策略', 
      dataIndex: 'strategyCode', 
      width: 110, 
      align: 'center',
      render: (code, record) => {
        if (!code) return <span className="text-gray-400">-</span>;
        return (
          <Button 
            type="link" 
            size="small" 
            style={{ fontSize: '11px', padding: 0 }}
            onClick={() => handleViewStrategyDetail(code)}
          >
            {code}
          </Button>
        );
      }
    },
    { 
      title: '折后单价',
      dataIndex: 'finalPrice', 
      width: 110, 
      align: 'right', 
      render: (v) => <strong className="font-mono text-gray-900">¥{(v || 0).toFixed(2)}</strong>
    },
    {
      title: '数量',
      width: 85,
      render: (_, record) => (
        <InputNumber 
          min={1} 
          value={record.quantity || 1} 
          onChange={(val) => handleItemChange(record.id, 'quantity', val)} 
          style={{ width: '100%' }}
        />
      )
    },
    { 
      title: '标准总金额', 
      width: 110, 
      align: 'right', 
      render: (_, record) => {
        const stdTotal = (record.standardPrice || 0) * (record.quantity || 1);
        return <span className="font-mono text-gray-600">¥{stdTotal.toFixed(2)}</span>;
      }
    },
    { 
      title: '折后金额（不含税）', 
      dataIndex: 'amount', 
      width: 130, 
      align: 'right', 
      render: (v) => <strong className="font-mono text-amber-600">¥{(v || 0).toFixed(2)}</strong>
    },
    {
      title: '折后金额（含税）',
      width: 130,
      align: 'right',
      render: (_, record) => {
        const amt = (record.finalPrice || 0) * (record.quantity || 1);
        const taxedAmt = amt * (1 + taxRate);
        return <strong className="font-mono text-amber-600">¥{taxedAmt.toFixed(2)}</strong>;
      }
    },
    {
      title: '备注',
      width: 120,
      render: (_, record) => (
        <Input 
          placeholder="备注" 
          value={record.remark || ''} 
          onChange={(e) => handleItemChange(record.id, 'remark', e.target.value)} 
          style={{ fontSize: '11px' }}
        />
      )
    },
    {
      title: '操作',
      width: 50,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          size="small"
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveItem(record.id)} 
        />
      )
    }
  ];

  return (
    <Modal forceRender
      title={editingRecord ? `编辑报价单 - ${editingRecord.quotationNo}` : '新建报价单'}
      open={open}
      onCancel={onCancel}
      width={1250}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="draft" onClick={() => handleSaveDraft(false)}>保存草稿</Button>,
        <Button key="submit" type="primary" onClick={() => handleSaveDraft(true)}>保存并提交</Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="quotationNo" label="报价单号">
              <Input disabled className="bg-gray-50" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="客户" required>
              <Space.Compact style={{ width: '100%' }}>
                <Input 
                  placeholder="请选择客户" 
                  value={selectedCustomer ? `${selectedCustomer.code} - ${selectedCustomer.name} [${selectedCustomer.type}]` : ''} 
                  disabled 
                  className="bg-gray-50 text-gray-800"
                />
                <Button type="primary" icon={<UserOutlined />} onClick={() => setCustomerModalOpen(true)}>选择客户</Button>
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="quotationDate" label="报价日期" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="expectedDeliveryDate" label="预计交期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="salesperson" label="业务员" rules={[{ required: true }]}>
              <Select>
                {employees.map(e => <Select.Option key={e.name} value={e.name}>{e.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="sourceEstimationNo" label="来源预估单号">
              <Input 
                placeholder="点击选择来源预估单" 
                readOnly 
                onClick={() => setEstimationModalOpen(true)}
                className="cursor-pointer hover:border-blue-400"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="title" label="报价标题">
              <Input placeholder="输入标题，如：办公家具配套报价" maxLength={50} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="是否存在定制产品">
              <Select
                value={items.some(i => i.isCustom) ? '是' : '否'}
                disabled
                className="bg-gray-50 text-gray-700"
                options={[
                  { value: '是', label: '是' },
                  { value: '否', label: '否' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="taxRate" label="税率">
              <Input placeholder="输入税率，如 0.13 或 13%" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="isDeposit" label="收定金" valuePropName="checked">
              <Switch checked={useDeposit} onChange={setUseDeposit} />
            </Form.Item>
          </Col>
          {useDeposit && (
            <Col span={6}>
              <Form.Item name="depositRate" label="定金比例(%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} value={depositRate} onChange={setDepositRate} />
              </Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item name="paymentInfo" label="收款信息">
              <TextArea rows={1} placeholder="支付约定" maxLength={200} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="validityRange" label="报价有效期">
              <DatePicker.RangePicker style={{ width: '100%' }} placeholder={['生效日期', '截止日期']} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remark" label="备注">
              <TextArea rows={1} placeholder="内部说明" maxLength={250} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ margin: '16px 0 8px 0' }}>标品明细</Divider>
        <div className="flex justify-between items-center mb-2 bg-gray-50 p-2.5 rounded border border-blue-50">
          <span className="text-gray-500 text-xs">
            <InfoCircleOutlined className="text-blue-500 mr-1.5" />
            通过标准产品目录添加标准产品，系统会根据客户自动选配最优惠价格策略折扣。
          </span>
          <Button 
            type="primary" 
            ghost
            size="small"
            icon={<PlusOutlined />} 
            onClick={handleAddStandardItem}
          >
            添加标品
          </Button>
        </div>
        
        <Table
          dataSource={items.filter(i => !i.isCustom)}
          columns={standardColumns}
          rowKey="id"
          size="small"
          scroll={{ x: 2390 }}
          pagination={false}
          className="border border-gray-100 rounded mb-4"
          locale={{ emptyText: '暂无标品，点击右上角按钮添加标品' }}
        />

        <Divider titlePlacement="left" style={{ margin: '16px 0 8px 0' }}>定制品明细</Divider>
        <div className="flex justify-between items-center mb-2 bg-gray-50 p-2.5 rounded border border-green-50">
          <span className="text-gray-500 text-xs">
            <InfoCircleOutlined className="text-green-600 mr-1.5" />
            通过定制流程添加定制品，点击“选择替代料和标品”进行定制BOM多级替代选配与自动差价计价。
          </span>
          <Button 
            type="primary" 
            size="small"
            className="bg-green-600 hover:!bg-green-700 border-none text-white font-medium"
            icon={<PlusOutlined />} 
            onClick={handleAddCustomItem}
          >
            添加定制品
          </Button>
        </div>
        
        <Table
          dataSource={items.filter(i => i.isCustom)}
          columns={customColumns}
          rowKey="id"
          size="small"
          scroll={{ x: 2490 }}
          pagination={false}
          className="border border-gray-100 rounded"
          locale={{ emptyText: '暂无定制品，点击右上角"添加定制品"按钮并选择替代料进行配置' }}
        />

        <Divider style={{ margin: '16px 0 8px 0' }} />
        
        {/* 费用汇总区域 */}
        <Row justify="end">
          <Col xs={24} sm={16} md={10}>
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-1">费用汇总 / Summary</div>
              <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                <Row wrap={false} align="middle">
                  <Col span={14} className="text-gray-500 text-xs">订单总额:</Col>
                  <Col span={10} className="text-right font-mono text-gray-700">¥{(calculations.productTotal || 0).toFixed(2)}</Col>
                </Row>
                
                <Row wrap={false} align="middle">
                  <Col span={14} className="text-gray-500 text-xs">优惠金额:</Col>
                  <Col span={10} className="text-right font-mono text-green-600 font-semibold">- ¥{(calculations.saving || 0).toFixed(2)}</Col>
                </Row>
                
                <Row wrap={false} align="middle">
                  <Col span={14} className="text-gray-500 text-xs font-semibold">订单不含税折后总额:</Col>
                  <Col span={10} className="text-right font-mono text-gray-900 font-semibold">¥{(calculations.discountedTotal || 0).toFixed(2)}</Col>
                </Row>
                
                <Row wrap={false} align="middle">
                  <Col span={14} className="text-gray-500 text-xs font-semibold">订单含税折后总额:</Col>
                  <Col span={10} className="text-right font-mono text-gray-900 font-semibold">¥{(calculations.taxedProductTotal || 0).toFixed(2)}</Col>
                </Row>
                
                <Row wrap={false} align="middle">
                  <Col span={14} className="text-gray-500 text-xs font-medium">其他费用:</Col>
                  <Col span={10} className="text-right">
                    <InputNumber 
                      size="small" 
                      min={0} 
                      value={otherFees} 
                      onChange={(v) => setOtherFees(v || 0)}
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                      style={{ width: '100px', textAlign: 'right' }} 
                    />
                  </Col>
                </Row>
                
                <Divider style={{ margin: '6px 0' }} />
                
                <Row wrap={false} align="middle">
                  <Col span={14} className="text-gray-800 font-semibold text-sm">订单应收总额:</Col>
                  <Col span={10} className="text-right font-mono text-red-600 font-bold text-lg">¥{(calculations.totalAmount || 0).toFixed(2)}</Col>
                </Row>
                
                {useDeposit && (
                  <Row wrap={false} align="middle" className="bg-amber-50 p-1 border border-dashed border-amber-200 rounded">
                    <Col span={14} className="text-amber-800 text-xs font-medium">
                      定金应收 ({depositRate.toFixed(0)}%):
                    </Col>
                    <Col span={10} className="text-right font-mono text-amber-600 font-bold">
                      ¥{(calculations.depositAmount || 0).toFixed(2)}
                    </Col>
                  </Row>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Customer select modal */}
      <CustomerSelectModal 
        open={customerModalOpen} 
        onCancel={() => setCustomerModalOpen(false)} 
        onConfirm={setSelectedCustomer} 
      />

      {/* Estimation source select modal */}
      <EstimationSelectModal
        open={estimationModalOpen}
        onCancel={() => setEstimationModalOpen(false)}
        onSelect={(record) => {
           form.setFieldsValue({ sourceEstimationNo: record.orderNo });
           // Populate estimation items if any
           if (record.items && record.items.length > 0) {
             const preloaded = record.items.map(item => {
               const product = salableProducts.find(p => p.name === item.productName || p.code === item.productCode);
               const prObj = product || { code: item.productCode || 'PROD-EST', price: item.totalPrice || item.basePrice || 0, spec: item.spec || '' };
               const strategyResult = resolveStrategyForProduct(selectedCustomer, prObj, priceStrategies);
               
               const standardPrice = prObj.price || 0;
               const finalPrice = standardPrice * strategyResult.discountRate;
               
               return {
                 id: Date.now().toString() + Math.random(),
                 productCode: prObj.code,
                 productName: item.productName || prObj.name,
                 isCustom: item.status === '草稿' || false,
                 tempProductCode: (item.status === '草稿') ? `LS-${dayjs().format('YYMM')}${Math.floor(100 + Math.random() * 900)}` : '',
                 substituteProductCode: '',
                 substituteProductName: '',
                 substituteSpec: '',
                 spec: item.spec || prObj.spec || '',
                 model: prObj.category || 'M-2026',
                 category: prObj.category || '成品',
                  unit: item.unit || prObj.unit || '个',
                 stockQty: prObj.stock || 0,
                 availableQty: (prObj.stock || 0) - (prObj.occupiedQty || 0),
                 standardPrice,
                 marketPrice: standardPrice * 1.2,
                 floorPrice: standardPrice * 0.8,
                 discountRate: strategyResult.discountRate,
                 strategyCode: strategyResult.strategyCode,
                 finalPrice,
                 quantity: item.quantity || 1,
                 amount: finalPrice * (item.quantity || 1),
                 remark: item.remark || ''
               };
             });
             setItems(preloaded);
           }
        }}
      />

      {/* Attribute select modal */}
      <PropertySelectModal
        open={propertyModalOpen}
        onCancel={() => {
          setPropertyModalOpen(false);
          setCurrentEditingItem(null);
        }}
        productCode={currentEditingItem?.productCode}
        onConfirm={(property) => {
          handleItemChange(currentEditingItem.id, 'property', property);
        }}
      />

      {/* Choose substitute modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-indigo-600 font-semibold" />
            <span className="font-semibold text-gray-800 text-sm">定制化产品选配与BOM由主标品多级替代选配</span>
          </div>
        }
        open={substituteModalOpen}
        onCancel={() => {
          setSubstituteModalOpen(false);
          setWizardStep(0);
        }}
        width={wizardStep === 1 ? 840 : 700}
        footer={
          <div className="flex justify-between items-center w-full px-1">
            <span className="text-gray-400 text-xs font-mono">
              第 {wizardStep + 1} 步 / 共 3 步
            </span>
            <Space>
              <Button 
                onClick={() => {
                  setSubstituteModalOpen(false);
                  setWizardStep(0);
                }}
              >
                取消
              </Button>
              {wizardStep > 0 && (
                <Button 
                  icon={<LeftOutlined />} 
                  onClick={() => setWizardStep(wizardStep - 1)}
                >
                  上一步
                </Button>
              )}
              {wizardStep < 2 ? (
                <Button 
                  type="primary" 
                  icon={<RightOutlined />}
                  onClick={() => setWizardStep(wizardStep + 1)}
                  disabled={wizardStep === 0 && !wizardSelectedBaseProduct}
                >
                  下一步
                </Button>
              ) : (
                <Button 
                  type="primary"
                  className="bg-green-600 hover:!bg-green-700 border-none text-white font-medium flex items-center gap-1"
                  icon={<CheckOutlined style={{ fontSize: '12px' }} />}
                  onClick={handleWizardConfirm}
                >
                  完成选配并数据回填
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <div className="py-3 border-b border-gray-100 mb-4">
          <Steps
            current={wizardStep}
            size="small"
            className="custom-wizard-steps"
            items={[
              { title: '选择主标品' },
              { title: '配置BOM多级替代关系' },
              { title: '定制品预览确认' }
            ]}
          />
        </div>

        {/* STEP 1: CHOOSE TARGET STANDARD PRODUCT */}
        {wizardStep === 0 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 text-xs font-medium shrink-0">产品编码:</span>
                <Input 
                  size="small" 
                  placeholder="请输入产品编码" 
                  value={wizardSearchCode} 
                  onChange={e => setWizardSearchCode(e.target.value)}
                  style={{ width: 140 }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 text-xs font-medium shrink-0">产品名称:</span>
                <Input 
                  size="small" 
                  placeholder="请输入产品名称" 
                  value={wizardSearchName} 
                  onChange={e => setWizardSearchName(e.target.value)}
                  style={{ width: 140 }}
                />
              </div>
              <Space size="small">
                <Button 
                  size="small" 
                  icon={<SearchOutlined />} 
                  type="primary"
                  onClick={() => {
                    // Triggers useMemo filter
                  }}
                >
                  搜索
                </Button>
                <Button 
                  size="small" 
                  icon={<ReloadOutlined />} 
                  onClick={() => {
                    setWizardSearchCode('');
                    setWizardSearchName('');
                    setWizardSelectedBaseProduct(null);
                  }}
                >
                  重置
                </Button>
              </Space>
            </div>

            <Table
              dataSource={salableProducts.filter(p => {
                const matchCode = !wizardSearchCode || p.code.toLowerCase().includes(wizardSearchCode.toLowerCase());
                const matchName = !wizardSearchName || p.name.includes(wizardSearchName);
                return matchCode && matchName;
              })}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              onRow={(record) => ({
                onClick: () => setWizardSelectedBaseProduct(record),
                className: 'cursor-pointer'
              })}
              className="border border-gray-100 rounded"
              columns={[
                {
                  title: '选择',
                  dataIndex: 'select',
                  width: 50,
                  align: 'center',
                  render: (_, record) => (
                    <Radio checked={wizardSelectedBaseProduct?.code === record.code} />
                  )
                },
                {
                  title: '产品编码',
                  dataIndex: 'code',
                  className: 'font-mono text-gray-800'
                },
                {
                  title: '产品名称',
                  dataIndex: 'name',
                  className: 'font-medium text-gray-900'
                },
                {
                  title: '规格',
                  dataIndex: 'spec'
                },
                {
                  title: '基本标准售价',
                  dataIndex: 'price',
                  align: 'right',
                  className: 'font-mono text-blue-600 font-semibold',
                  render: (v) => `¥${v?.toFixed(2)}`
                },
                {
                  title: '分类类型',
                  dataIndex: 'category',
                  render: (v) => <Badge status="success" text={v || '成品'} />
                }
              ]}
            />
            
            {wizardSelectedBaseProduct && (
              <div className="bg-blue-50 p-3 rounded border border-blue-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500">已选主标品:</span>
                  <span className="font-semibold text-blue-800 ml-1.5">{wizardSelectedBaseProduct.name} ({wizardSelectedBaseProduct.code})</span>
                </div>
                <div className="font-semibold text-blue-700">
                  基础价: ¥{wizardSelectedBaseProduct.price?.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT BOM HIERARCHY SUBSTITUTES */}
        {wizardStep === 1 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <BranchesOutlined className="text-blue-500" />
                <span className="font-semibold text-gray-800 text-xs">BOM 层级关系与替代项</span>
                <span className="text-orange-600 text-xs font-normal ml-1">（只勾选需要替换的子件，无需替换可不勾选）</span>
              </div>
              <Space>
                <Button 
                  size="small" 
                  type="link" 
                  className="text-xs" 
                  onClick={() => {
                    const relations = getBOMRelations(wizardSelectedBaseProduct);
                    const nodeKeys = [];
                    const collect = (node) => {
                      nodeKeys.push(node.id || node.code);
                      if (node.children) {
                        node.children.forEach(collect);
                      }
                    };
                    collect(relations);
                    setBomExpandedKeys(nodeKeys);
                  }}
                >
                  全部展开
                </Button>
                <span className="text-gray-300">|</span>
                <Button 
                  size="small" 
                  type="link" 
                  className="text-xs text-gray-500" 
                  onClick={() => setBomExpandedKeys([])}
                >
                  折叠所有
                </Button>
              </Space>
            </div>

            <div className="max-h-[380px] overflow-y-auto bg-slate-50 p-4 border border-gray-100 rounded-lg">
              {(() => {
                const relations = getBOMRelations(wizardSelectedBaseProduct);
                if (!relations) {
                  return <div className="text-center text-gray-400 py-6">请先在上一步选择主标品</div>;
                }

                const renderBOMNode = (node, depth = 0) => {
                  if (!node) return null;
                  const isExpanded = bomExpandedKeys.includes(node.id || node.code);
                  const hasChildren = node.children && node.children.length > 0;
                  const hasAlts = node.alternatives && node.alternatives.length > 0;

                  const handleToggle = (e) => {
                    e.stopPropagation();
                    const key = node.id || node.code;
                    if (isExpanded) {
                      setBomExpandedKeys(bomExpandedKeys.filter(k => k !== key));
                    } else {
                      setBomExpandedKeys([...bomExpandedKeys, key]);
                    }
                  };

                  return (
                    <div key={node.id || node.code} className="mb-2 select-none">
                      <div 
                        onClick={hasChildren ? handleToggle : undefined}
                        className={`
                          flex items-center justify-between p-2.5 rounded transition-all border
                          ${depth === 0 ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50' : ''}
                          ${depth === 1 ? 'bg-orange-50/20 border-orange-100 hover:bg-orange-50/30 ml-5' : ''}
                          ${depth === 2 ? 'bg-gray-50 border-gray-100 hover:bg-gray-100/50 ml-10' : ''}
                          ${hasChildren ? 'cursor-pointer font-medium' : ''}
                        `}
                      >
                        <div className="flex items-center flex-1 min-w-0 text-xs">
                          {hasChildren ? (
                            <span className="w-5 h-5 flex items-center justify-center text-gray-400 mr-1 hover:text-gray-600 shrink-0">
                              {isExpanded ? <DownOutlined className="text-[10px]" /> : <RightOutlined className="text-[10px]" />}
                            </span>
                          ) : (
                            <span className="w-5 shrink-0" />
                          )}

                          {depth === 0 && <span className="font-bold mr-1.5 text-blue-500 text-sm">📦</span>}
                          {depth === 1 && <span className="font-bold mr-1.5 text-amber-500 text-xs">⚙️</span>}
                          {depth === 2 && <span className="font-bold mr-1.5 text-gray-400 text-[10px]">🔹</span>}

                          <span className="font-semibold text-gray-800 mr-2 truncate">
                            {node.name}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400 px-1 py-0.5 bg-gray-100 border border-gray-200 rounded shrink-0 mr-2">
                            {node.code}
                          </span>

                          <span className="text-[10px] text-gray-400 font-normal scale-90 origin-left shrink-0">
                            {node.category}
                          </span>
                        </div>

                        {node.unitQty && (
                          <span className="text-gray-400 text-xs font-mono shrink-0 ml-2">
                            ({node.unitQty})
                          </span>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="mt-1">
                          {node.children.map(child => renderBOMNode(child, depth + 1))}
                        </div>
                      )}

                      {hasAlts && isExpanded && (
                        <div className="mt-1.5 pl-3 ml-12 flex flex-col gap-1.5 border-l border-dashed border-gray-300">
                          {node.alternatives.map((alt) => {
                            const levelKey = node.levelKey;
                            const isSelected = wizardSelectedAlternatives[levelKey] === alt.key;

                            const handleAltClick = () => {
                              if (isSelected) {
                                const updated = { ...wizardSelectedAlternatives };
                                delete updated[levelKey];
                                setWizardSelectedAlternatives(updated);
                              } else {
                                setWizardSelectedAlternatives({
                                  ...wizardSelectedAlternatives,
                                  [levelKey]: alt.key
                                });
                              }
                            };

                            return (
                              <div 
                                key={alt.key}
                                onClick={handleAltClick}
                                className={`
                                  flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none transition-all
                                  ${isSelected 
                                    ? 'bg-blue-50/60 border-blue-400 shadow-sm ring-1 ring-blue-100' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                  }
                                `}
                              >
                                <div className="flex items-center min-w-0 text-xs">
                                  <div className={`
                                    w-4 h-4 rounded-full border flex items-center justify-center mr-2 transition-all shrink-0
                                    ${isSelected ? 'border-blue-500 bg-white' : 'border-gray-300 bg-white'}
                                  `}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                  </div>

                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 border border-amber-200 rounded shrink-0 mr-1.5">
                                    替代
                                  </span>

                                  <span className="text-gray-700 font-medium mr-1 truncate">
                                    {alt.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                    ({alt.code})
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className={`text-xs font-semibold font-mono ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {alt.diffPrice >= 0 ? `+¥${alt.diffPrice}` : `-¥${Math.abs(alt.diffPrice)}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                };

                return renderBOMNode(relations);
              })()}
            </div>

            <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-xs text-amber-800 flex items-start gap-1.5">
              <InfoCircleOutlined className="mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">选配提示</p>
                <p className="text-amber-700 leading-relaxed">
                  树形结构展示定制主体 BOM 嵌套层级，各节点仅支持单选替换物料；完成选配后，系统依据替代物料价格自动预估售价。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW AND CONFIRM CUSTOM PRODUCTS */}
        {wizardStep === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 text-xs mb-3 flex items-center gap-1.5">
                <TagOutlined className="text-indigo-600" /> 定制品属性定义
              </h4>
              <Row gutter={16}>
                <Col span={12}>
                  <div className="mb-3">
                    <span className="text-gray-500 text-xs block mb-1">定制品编码:</span>
                    <Input 
                      value={wizardCustomCode} 
                      readOnly
                      placeholder="动态生成的定制编码"
                      className="font-mono text-gray-600 bg-slate-100 font-semibold cursor-not-allowed"
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-3">
                    <span className="text-gray-500 text-xs block mb-1">定制品名称:</span>
                    <Input 
                      value={wizardCustomName} 
                      readOnly
                      placeholder="生成的定制品名称"
                      className="font-medium text-gray-600 bg-slate-100 cursor-not-allowed"
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="border border-gray-100 rounded-lg p-4 space-y-3.5 bg-white">
              <h4 className="font-semibold text-gray-800 text-xs flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <BranchesOutlined className="text-blue-500" /> 已勾选BOM替代料明细
              </h4>
              
              {(() => {
                if (!wizardSelectedBaseProduct) return null;
                const levels = getBOMLevelsForProduct(wizardSelectedBaseProduct);
                const selectedList = [];
                levels.forEach(lvl => {
                  const selectedKey = wizardSelectedAlternatives[lvl.key];
                  const matched = lvl.children.find(c => c.key === selectedKey);
                  if (matched) {
                    selectedList.push({
                      levelTitle: lvl.title,
                      altCode: matched.code,
                      altName: matched.name,
                      altSpec: matched.spec,
                      diffPrice: matched.diffPrice
                    });
                  }
                });

                if (selectedList.length === 0) {
                  return (
                    <div className="text-center text-gray-400 text-xs py-4">
                      尚未选配任何替代料，定制价格将与标品一致。
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {selectedList.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-blue-50/20 p-2 border border-blue-50 rounded text-xs">
                        <div>
                          <span className="text-blue-600 font-semibold mr-2">[替代层]</span>
                          <span className="text-gray-800 font-medium">{item.altName} ({item.altCode})</span>
                          <span className="text-gray-400 text-[11px] ml-2 font-mono">[{item.altSpec}]</span>
                        </div>
                        <div className="font-mono font-semibold text-blue-700">
                          +¥{item.diffPrice?.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Pricing Details card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 space-y-2.5">
              <h4 className="font-semibold text-gray-800 text-xs">差价定价与价格策略匹配预览</h4>
              
              {(() => {
                if (!wizardSelectedBaseProduct) return null;
                const levels = getBOMLevelsForProduct(wizardSelectedBaseProduct);
                let priceDiff = 0;
                levels.forEach(lvl => {
                  const selectedKey = wizardSelectedAlternatives[lvl.key];
                  const matched = lvl.children.find(c => c.key === selectedKey);
                  if (matched) priceDiff += matched.diffPrice;
                });

                const finalStandardPrice = (wizardSelectedBaseProduct.price || 0) + priceDiff;
                const strategyResult = resolveStrategyForProduct(selectedCustomer, { code: wizardSelectedBaseProduct.code, price: finalStandardPrice }, priceStrategies);
                const finalQuotedPrice = finalStandardPrice * strategyResult.discountRate;

                return (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">原标品基准价:</span>
                        <span className="font-mono text-gray-700 font-semibold">¥{wizardSelectedBaseProduct.price?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">物料替代差价合计:</span>
                        <span className="font-mono text-blue-600 font-semibold">+¥{priceDiff?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200/60 pt-1.5">
                        <span className="text-gray-700 font-semibold">定制前标准总单价:</span>
                        <span className="font-mono text-gray-900 font-bold">¥{finalStandardPrice?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-l border-gray-200 pl-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">匹配客户优惠策略:</span>
                        <span className="text-indigo-600 font-medium truncate max-w-[120px]" title={strategyResult.strategyName}>
                          {strategyResult.strategyName.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">策略折扣结算系数:</span>
                        <span className="font-mono text-indigo-700 font-bold">{strategyResult.discountRate?.toFixed(2)} ({strategyResult.discountRate * 10} 折)</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200/60 pt-1.5">
                        <span className="text-red-600 font-bold">折后最终结算单价:</span>
                        <span className="font-mono text-red-600 font-black text-sm">¥{finalQuotedPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Price Strategy details view modal */}
      <Modal
        title="匹配价格策略详情"
        open={strategyDetailModalOpen}
        onCancel={() => {
          setStrategyDetailModalOpen(false);
          setSelectedStrategyDetail(null);
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => {
            setStrategyDetailModalOpen(false);
            setSelectedStrategyDetail(null);
          }}>确认</Button>
        ]}
      >
        {selectedStrategyDetail && (
          <div style={{ padding: '8px 0' }}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="策略编码">{selectedStrategyDetail.code}</Descriptions.Item>
              <Descriptions.Item label="客户类型">{selectedStrategyDetail.customerCategory || '-'}</Descriptions.Item>
              <Descriptions.Item label="客户等级">{selectedStrategyDetail.customerLevel || '-'}</Descriptions.Item>
              <Descriptions.Item label="客户区域">{selectedStrategyDetail.customerRegion || '-'}</Descriptions.Item>
              <Descriptions.Item label="物料限制">{selectedStrategyDetail.productInfo || '不限（通用物料优惠）'}</Descriptions.Item>
              <Descriptions.Item label="折扣率/结算系数">
                <Text type="danger" strong>{selectedStrategyDetail.discountRate}</Text> (相当于标准单价的 {selectedStrategyDetail.discountRate * 10} 折优惠系数)
              </Descriptions.Item>
              <Descriptions.Item label="有效期限自">{selectedStrategyDetail.effectiveDate}</Descriptions.Item>
              <Descriptions.Item label="有效期限至">{selectedStrategyDetail.expiryDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={selectedStrategyDetail.status === '生效' ? 'success' : 'default'} text={selectedStrategyDetail.status} />
              </Descriptions.Item>
              {selectedStrategyDetail.operator && (
                <Descriptions.Item label="经办人">{selectedStrategyDetail.operator}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default QuotationFormModal;
