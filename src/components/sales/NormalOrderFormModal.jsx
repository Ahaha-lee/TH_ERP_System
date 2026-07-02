
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Modal, 
  Form, 
  Row, 
  Col, 
  Input, 
  DatePicker, 
  Select, 
  InputNumber, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Divider, 
  message,
  Checkbox,
  Tag,
  Switch,
  Tooltip,
  Descriptions,
  Steps,
  Radio,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  UserOutlined,
  SwapOutlined,
  InfoCircleOutlined,
  BranchesOutlined,
  DownOutlined,
  RightOutlined,
  CheckOutlined,
  SearchOutlined,
  CheckCircleFilled,
  TagOutlined,
  LeftOutlined,
  SyncOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData } from '../../mock/data';
import CustomerSelectModal from '../quotation/CustomerSelectModal';
import QuotationSelectModal from './QuotationSelectModal';
import PropertySelectModal from '../quotation/PropertySelectModal';
import { resolveStrategyForProduct } from '../quotation/QuotationFormModal';

const { TextArea } = Input;
const { Text, Title, Link } = Typography;

const NormalOrderFormModal = ({ open, record, initialData, onCancel, onClose, onSuccess, mode = 'add' }) => {
    const [form] = Form.useForm();
    const [products] = useMockData('products');
    const [employees] = useMockData('employees');
    const [customers] = useMockData('customers');
    const [priceStrategies] = useMockData('priceStrategiesLedger');

    const activeRecord = record || initialData;
    const handleClose = onCancel || onClose;
    const isReadonly = mode === 'detail' || mode === 'audit';

    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [quotationModalOpen, setQuotationModalOpen] = useState(false);
    const [propertyModalOpen, setPropertyModalOpen] = useState({ open: false, index: null, isGift: false });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [giftItems, setGiftItems] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Substitute selection and wizard states
    const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
    const [activeItemForSubstitute, setActiveItemForSubstitute] = useState(null);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardActiveRowId, setWizardActiveRowId] = useState(null);
    const [wizardSearchCode, setWizardSearchCode] = useState('');
    const [wizardSearchName, setWizardSearchName] = useState('');
    const [wizardSelectedBaseProduct, setWizardSelectedBaseProduct] = useState(null);
    const [wizardSelectedAlternatives, setWizardSelectedAlternatives] = useState({});
    const [bomExpandedKeys, setBomExpandedKeys] = useState([]);
    const [wizardCustomCode, setWizardCustomCode] = useState('');
    const [wizardCustomName, setWizardCustomName] = useState('');

    // Strategy detail modal states
    const [strategyDetailModalOpen, setStrategyDetailModalOpen] = useState(false);
    const [selectedStrategyDetail, setSelectedStrategyDetail] = useState(null);

    const salableProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p => p.category === '成品' || p.category === '原料' || p.category === '原材料');
    }, [products]);

    useEffect(() => {
        if (open) {
            if (activeRecord) {
                form.setFieldsValue({
                    ...activeRecord,
                    orderDate: dayjs(activeRecord.orderDate),
                    expectDeliveryDate: activeRecord.expectDeliveryDate ? dayjs(activeRecord.expectDeliveryDate) : null,
                    urgency: activeRecord.urgency || (activeRecord.isUrgent ? '紧急' : '一般'),
                    taxRate: activeRecord.taxRate ?? '13%',
                    auditResult: activeRecord.auditResult || activeRecord.approvalResult || undefined,
                    auditRemark: activeRecord.auditRemark || undefined,
                });
                const customer = customers.find(c => c.id === activeRecord.customerId || c.name === activeRecord.customerName);
                if (customer) setSelectedCustomer(customer);
                setItems(activeRecord.items?.map(item => ({ ...item, id: item.id || Math.random().toString(36).substr(2, 9) })) || []);
                setGiftItems(activeRecord.giftItems?.map(item => ({ ...item, id: item.id || Math.random().toString(36).substr(2, 9) })) || []);
            } else { 
                const tempNo = 'ORD-' + Date.now().toString().substr(-6);
                form.setFieldsValue({
                    orderNo: tempNo,
                    orderDate: dayjs(),
                    isCollectDeposit: true,
                    depositRatio: 30,
                    salesperson: '管理员',
                    subsidiary: '总部',
                    includeInStockingPlan: true,
                    urgency: '一般',
                    taxRate: '13%',
                    auditResult: undefined,
                    auditRemark: undefined
                });
                setSelectedCustomer(null);
                setItems([]);
                setGiftItems([]);
            }
        }
    }, [open, activeRecord, form, customers]);

    const handleCustomerConfirm = (customer) => {
        setSelectedCustomer(customer);
        form.setFieldsValue({
            customerName: customer.name,
            customerType: customer.type,
            settlementMethod: customer.settlementMethod,
            monthlyCycle: customer.settlementMethod === '月结' ? '30天' : undefined,
            prepaidBalance: customer.prepaidBalance || 0
        });
        setCustomerModalOpen(false);
    };

    const handleQuotationConfirm = (quotation) => {
        form.setFieldsValue({
            quotationNo: quotation.quotationNo,
            customerName: quotation.customerName,
        });
        const customer = customers.find(c => c.id === quotation.customerId || c.name === quotation.customerName);
        if (customer) {
            handleCustomerConfirm(customer);
        }
        
        if (quotation.items && quotation.items.length > 0) {
            setItems(quotation.items.map(item => ({
                ...item,
                id: Math.random().toString(36).substr(2, 9),
                totalUnitPrice: item.unitPrice || item.finalPrice,
                finalPrice: item.finalPrice,
                amount: item.amount
            })));
        }
        setQuotationModalOpen(false);
    };

    const addStandardItem = () => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            productCode: undefined,
            productName: undefined,
            isCustom: false,
            substituteProductCode: '',
            substituteProductName: '',
            substituteSpec: '',
            tempProductCode: '',
            spec: '',
            model: 'M-2026',
            property: '',
            stockQty: 100,
            availableQty: 80,
            occupiedQty: 20,
            quantity: 1,
            unit: '个',
            standardPrice: 0,
            marketPrice: 0,
            floorPrice: 0,
            totalUnitPrice: 0,
            discountRate: 5,
            strategyCode: 'DEFAULT',
            finalPrice: 0,
            amount: 0,
            remark: ''
        };
        setItems([...items, newItem]);
    };

    const addCustomItem = () => {
        setWizardActiveRowId('NEW_CUSTOM_ITEM');
        setWizardStep(0);
        setWizardSearchCode('');
        setWizardSearchName('');
        setWizardSelectedBaseProduct(null);
        setWizardSelectedAlternatives({});
        setBomExpandedKeys([]);
        setSubstituteModalOpen(true);
    };

    const addItem = (isGift = false) => {
        if (isGift) {
            const newItem = {
                id: Math.random().toString(36).substr(2, 9),
                productCode: undefined,
                productName: undefined,
                isCustom: false,
                substituteProductCode: '',
                substituteProductName: '',
                substituteSpec: '',
                tempProductCode: '',
                spec: '',
                model: 'M-2026',
                property: '',
                stockQty: 100,
                availableQty: 80,
                occupiedQty: 20,
                quantity: 1,
                unit: '个',
                standardPrice: 0,
                marketPrice: 0,
                floorPrice: 0,
                totalUnitPrice: 0,
                discountRate: 5,
                strategyCode: 'DEFAULT',
                finalPrice: 0,
                amount: 0,
                remark: ''
            };
            setGiftItems([...giftItems, newItem]);
        } else {
            addStandardItem();
        }
    };

    const handleProductChange = (val, itemId, isGift = false) => {
        const product = products?.find(p => p.id === val || p.code === val || p.name === val);
        if (!product) return;

        if (isGift) {
            const index = giftItems.findIndex(i => i.id === itemId);
            if (index === -1) return;
            const updateList = [...giftItems];
            updateList[index] = {
                ...updateList[index],
                productCode: product.code,
                productName: product.name,
                spec: product.spec || '',
                unit: product.unit || '个',
                model: product.model || product.category || 'M-2026',
                property: product.code === 'PROD001' ? '头层牛皮' : (product.code === 'PROD002' ? '胡桃木' : '不锈钢'),
                stockQty: product.stock ?? 100,
                availableQty: product.availableQty ?? ((product.stock ?? 100) - (product.occupiedQty ?? 20)),
                occupiedQty: product.occupiedQty ?? 20,
            };
            setGiftItems(updateList);
        } else {
            const index = items.findIndex(i => i.id === itemId);
            if (index === -1) return;
            const updateList = [...items];
            const discountRate = updateList[index]?.discountRate ?? 5;
            
            const standardPrice = product.price || 0;
            const totalUnitPrice = standardPrice;
            const finalPrice = totalUnitPrice * (1 - discountRate / 100);
            const stockQty = product.stock ?? 100;
            const occupied = product.occupiedQty ?? 20;
            const availableQty = product.availableQty ?? (stockQty - occupied);
            const model = product.model || product.category || 'M-2026';
            const defaultProperty = product.code === 'PROD001' ? '头层牛皮' : (product.code === 'PROD002' ? '胡桃木' : '不锈钢');

            updateList[index] = {
                ...updateList[index],
                productCode: product.code,
                productName: product.name,
                spec: product.spec || '',
                unit: product.unit || '个',
                model: model,
                property: defaultProperty,
                stockQty: stockQty,
                availableQty: availableQty,
                occupiedQty: occupied,
                standardPrice: standardPrice,
                marketPrice: product.marketPrice || standardPrice * 1.2,
                floorPrice: product.floorPrice || product.cost || standardPrice * 0.8,
                totalUnitPrice: totalUnitPrice,
                discountRate: discountRate,
                finalPrice: finalPrice,
                amount: (updateList[index].quantity || 1) * finalPrice
            };
            setItems(updateList);
        }
    };

    const handleItemFieldChange = (itemId, field, val, isGift = false) => {
        if (isGift) {
            const index = giftItems.findIndex(i => i.id === itemId);
            if (index === -1) return;
            const updateList = [...giftItems];
            updateList[index] = {
                ...updateList[index],
                [field]: val
            };
            setGiftItems(updateList);
        } else {
            const index = items.findIndex(i => i.id === itemId);
            if (index === -1) return;
            const updateList = [...items];
            
            if (field === 'isCustom') {
                updateList[index][field] = val;
                if (val === true) {
                    updateList[index].tempProductCode = `LS-${dayjs().format('YYMM')}${Math.floor(100 + Math.random() * 900)}`;
                } else {
                    updateList[index].tempProductCode = '';
                    updateList[index].substituteProductCode = '';
                    updateList[index].substituteProductName = '';
                    updateList[index].substituteSpec = '';
                }
            } else if (field === 'totalUnitPrice' || field === 'standardPrice') {
                updateList[index].standardPrice = val || 0;
                updateList[index].totalUnitPrice = val || 0;
            } else {
                updateList[index][field] = val;
            }

            // Recalculate derivative fields
            const standardPrice = updateList[index].standardPrice ?? 0;
            const discountRate = updateList[index].discountRate ?? 5;
            const finalPrice = standardPrice * (1 - discountRate / 100);
            updateList[index].finalPrice = finalPrice;
            updateList[index].amount = (updateList[index].quantity || 0) * finalPrice;

            setItems(updateList);
        }
    };

    const handleFieldChange = (field, val, index, isGift = false) => {
        const list = isGift ? giftItems : items;
        const itemId = list[index]?.id;
        if (itemId) {
            handleItemFieldChange(itemId, field, val, isGift);
        }
    };

    const handlePropertyConfirm = (property) => {
        const { index, isGift } = propertyModalOpen;
        const updateList = isGift ? [...giftItems] : [...items];
        updateList[index] = {
            ...updateList[index],
            property
        };
        if (isGift) setGiftItems(updateList);
        else setItems(updateList);
        setPropertyModalOpen({ open: false, index: null, isGift: false });
    };

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

    const openSubstituteWizard = (record) => {
        setWizardActiveRowId(record.id);
        setWizardStep(0);
        setWizardSearchCode('');
        setWizardSearchName('');
        
        // Attempt to parse existing substitute or start fresh
        let matchedBaseProduct = null;
        if (record.productCode) {
            const baseCode = record.productCode.split('-')[0];
            matchedBaseProduct = products.find(p => p.code === baseCode);
        }
        
        setWizardSelectedBaseProduct(matchedBaseProduct);
        setWizardSelectedAlternatives({});
        setBomExpandedKeys([]);
        setSubstituteModalOpen(true);
    };

    const handleWizardConfirm = () => {
        if (!wizardSelectedBaseProduct) {
            message.error('请选择标品');
            return;
        }
        
        const levels = getBOMLevelsForProduct(wizardSelectedBaseProduct);
        const selectedAltsList = [];
        let priceDiffSum = 0;
        
        levels.forEach(lvl => {
            const selectedKey = wizardSelectedAlternatives[lvl.key];
            if (selectedKey) {
                const alt = lvl.children.find(c => c.key === selectedKey);
                if (alt) {
                    selectedAltsList.push(alt);
                    priceDiffSum += (alt.diffPrice || 0);
                }
            }
        });

        const finalStandardPrice = (wizardSelectedBaseProduct.price || 0) + priceDiffSum;
        const descSpec = `${wizardSelectedBaseProduct.spec || '标品'} (定制替代: ${selectedAltsList.map(a => `${a.name}[${a.spec || ''}]`).join(', ')})`;
        const customCode = wizardCustomCode || `${wizardSelectedBaseProduct.code}-CUST-${Math.floor(100 + Math.random() * 900)}`;
        const customName = wizardCustomName || `定制-${wizardSelectedBaseProduct.name}`;
        
        const strategyResult = resolveStrategyForProduct(selectedCustomer, { code: wizardSelectedBaseProduct.code, price: finalStandardPrice }, priceStrategies);
        
        const totalStock = products.filter(p => p.code === wizardSelectedBaseProduct.code).reduce((sum, p) => sum + (p.stock || 0), 0);
        const occupiedQty = wizardSelectedBaseProduct.occupiedQty || 0;
        
        if (wizardActiveRowId === 'NEW_CUSTOM_ITEM') {
            const currentDiscountRate = (1 - strategyResult.discountRate) * 100;
            const finalPrice = finalStandardPrice * (1 - currentDiscountRate / 100);
            const newItem = {
                id: Math.random().toString(36).substr(2, 9),
                productCode: customCode,
                productName: customName,
                isCustom: true,
                substituteProductCode: selectedAltsList.map(a => a.code).join('/') || '无',
                substituteProductName: selectedAltsList.map(a => a.name).join('/') || '无',
                substituteSpec: selectedAltsList.map(a => `${a.name}(${a.code}) - ${a.spec || ''}`).join('; '),
                spec: descSpec,
                model: wizardSelectedBaseProduct.category || '定制成品',
                property: '标准属性',
                category: '定制成品',
                stockQty: totalStock,
                availableQty: totalStock - occupiedQty,
                occupiedQty: occupiedQty,
                quantity: 1,
                unit: '个',
                standardPrice: finalStandardPrice,
                marketPrice: finalStandardPrice * 1.2,
                floorPrice: finalStandardPrice * 0.8,
                totalUnitPrice: finalStandardPrice,
                discountRate: currentDiscountRate,
                strategyCode: strategyResult.strategyCode,
                finalPrice: finalPrice,
                amount: finalPrice,
                remark: ''
            };
            setItems([...items, newItem]);
        } else {
            const newItems = items.map(item => {
                if (item.id === wizardActiveRowId) {
                    const currentDiscountRate = item.discountRate !== undefined ? item.discountRate : ((1 - strategyResult.discountRate) * 100);
                    const finalPrice = finalStandardPrice * (1 - currentDiscountRate / 100);
                    return {
                        ...item,
                        productCode: customCode,
                        productName: customName,
                        spec: descSpec,
                        model: wizardSelectedBaseProduct.category || '定制成品',
                        property: item.property || '标准属性',
                        category: '定制成品',
                        stockQty: totalStock,
                        availableQty: totalStock - occupiedQty,
                        occupiedQty: occupiedQty,
                        standardPrice: finalStandardPrice,
                        marketPrice: finalStandardPrice * 1.2,
                        floorPrice: finalStandardPrice * 0.8,
                        totalUnitPrice: finalStandardPrice,
                        discountRate: currentDiscountRate,
                        strategyCode: strategyResult.strategyCode,
                        finalPrice: finalPrice,
                        amount: (item.quantity || 1) * finalPrice,
                        substituteProductCode: selectedAltsList.map(a => a.code).join('/') || '无',
                        substituteProductName: selectedAltsList.map(a => a.name).join('/') || '无',
                        substituteSpec: selectedAltsList.map(a => `${a.name}(${a.code}) - ${a.spec || ''}`).join('; ')
                    };
                }
                return item;
            });
            setItems(newItems);
        }
        setSubstituteModalOpen(false);
        setActiveItemForSubstitute(null);
        setWizardSelectedBaseProduct(null);
        setWizardSelectedAlternatives({});
    };

    const handleShowStrategyDetail = (strategyCode) => {
        let detail = {
            code: strategyCode || 'DEFAULT',
            customerCategory: selectedCustomer?.type || '所有等级',
            customerLevel: selectedCustomer?.level || '所有等级',
            customerRegion: selectedCustomer?.region || '华南',
            productInfo: '所有产品通用',
            discountRate: 0.95,
            effectiveDate: dayjs().startOf('year').format('YYYY-MM-DD'),
            expiryDate: dayjs().endOf('year').format('YYYY-MM-DD'),
            status: '生效',
            operator: '主财务管理员'
        };
        if (priceStrategies && priceStrategies.length > 0) {
            const matched = priceStrategies.find(s => s.code === strategyCode);
            if (matched) {
                detail = {
                    ...matched,
                    discountRate: matched.discountRate || 0.95
                };
            }
        }
        setSelectedStrategyDetail(detail);
        setStrategyDetailModalOpen(true);
    };

    const otherFee = Form.useWatch('otherFee', form) || 0;
    const isCollectDeposit = Form.useWatch('isCollectDeposit', form);
    const depositRatio = Form.useWatch('depositRatio', form) || 0;
    const taxRateStr = Form.useWatch('taxRate', form);

    const taxRate = useMemo(() => {
        if (!taxRateStr) return 0;
        const clean = String(taxRateStr).replace('%', '').trim();
        const num = parseFloat(clean);
        if (isNaN(num)) return 0;
        // If they write 13, it will be mapped to 0.13; if they write 0.13, it remains 0.13
        return num > 1 ? num / 100 : num;
    }, [taxRateStr]);

    const totalSummaries = useMemo(() => {
        const productTotal = items.reduce((sum, item) => sum + ((item.standardPrice || 0) * (item.quantity || 0)), 0);
        const discountedProductTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalSaving = productTotal - discountedProductTotal;
        const taxedProductTotal = discountedProductTotal * (1 + taxRate);
        const orderTotal = taxedProductTotal + otherFee;
        const depositReceivable = isCollectDeposit ? orderTotal * (depositRatio / 100) : 0;

        return {
            productTotal,
            discountedProductTotal,
            totalSaving,
            taxedProductTotal,
            depositReceivable,
            orderTotal
        };
    }, [items, taxRate, otherFee, isCollectDeposit, depositRatio]);

    const getStandardColumns = () => [
        { title: '序号', width: 50, render: (_, __, i) => i + 1, fixed: 'left' },
        { 
            title: '产品编码', 
            dataIndex: 'productCode', 
            width: 140,
            fixed: 'left',
            render: (val, record) => {
                if (isReadonly) return <span className="font-mono text-gray-700">{val || '-'}</span>;
                return (
                    <Select 
                        showSearch 
                        placeholder="选择编码" 
                        style={{ width: '100%' }} 
                        value={val}
                        onChange={(v) => handleProductChange(v, record.id)}
                        options={salableProducts.map(p => ({ label: p.code, value: p.code }))}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                );
            }
        },
        { 
            title: '产品名称', 
            dataIndex: 'productName', 
            width: 150,
            render: (val, record) => {
                if (isReadonly) return <span>{val || '-'}</span>;
                return (
                    <Select 
                        showSearch 
                        placeholder="选择名称" 
                        style={{ width: '100%' }} 
                        value={val}
                        onChange={(v) => handleProductChange(v, record.id)}
                        options={salableProducts.map(p => ({ label: p.name, value: p.name }))}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                );
            }
        },
        { title: '规格', dataIndex: 'spec', width: 120 },
        { title: '型号', dataIndex: 'model', width: 100, render: (v) => v || 'M-2026' },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 140,
            render: (val, record) => {
                if (isReadonly) return <span className="text-gray-700 font-medium">{val || '标准属性'}</span>;
                return (
                    <Button 
                        size="small"
                        type="dashed"
                        onClick={() => {
                            const index = items.findIndex(i => i.id === record.id);
                            setPropertyModalOpen({ open: true, index, isGift: false });
                        }}
                    >
                        {val ? `属性: ${val}` : '选择属性'}
                    </Button>
                );
            }
        },
        { 
            title: '产品类型', 
            dataIndex: 'category', 
            width: 100, 
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
            width: 90, 
            align: 'right', 
            render: (val) => <span className="font-mono text-gray-700">{val ?? 0}</span> 
        },
        { 
            title: '可用数量',
            dataIndex: 'availableQty', 
            width: 110, 
            align: 'right',
            render: (v) => {
                const val = v ?? 0;
                const isNegative = val < 0;
                return (
                    <span className={`font-mono font-medium ${isNegative ? 'text-red-600' : 'text-blue-600'}`}>
                        {val}
                    </span>
                );
            }
        },
        { 
            title: '占用数量', 
            dataIndex: 'occupiedQty', 
            width: 90, 
            align: 'right',
            render: (val, record) => {
                const stock = record.stockQty ?? 0;
                const avail = record.availableQty ?? 0;
                const occup = val ?? (stock - avail >= 0 ? stock - avail : 0);
                return <span className="font-mono text-gray-500">{occup}</span>;
            }
        },
        { 
            title: '在制数量', 
            dataIndex: 'wipQty', 
            width: 90, 
            align: 'right',
            render: (val, record) => {
                const wip = val ?? (record.id?.startsWith('NEW_') ? 0 : 35);
                return <span className="font-mono text-gray-500">{wip}</span>;
            }
        },
        { 
            title: '标准单价', 
            dataIndex: 'standardPrice', 
            width: 100, 
            align: 'right', 
            render: (v) => `¥${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
        },
        { 
            title: '市场指导价', 
            dataIndex: 'marketPrice', 
            width: 100, 
            align: 'right', 
            render: (v) => `¥${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
        },
        { 
            title: '底价', 
            dataIndex: 'floorPrice', 
            width: 100, 
            align: 'right', 
            render: (v) => `¥${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
        },
        { 
            title: '优惠折扣率', 
            dataIndex: 'discountRate', 
            width: 120,
            align: 'right',
            render: (val, record) => {
                if (isReadonly) return `${val ?? 5}%`;
                return (
                    <InputNumber 
                        min={0} 
                        max={100} 
                        style={{ width: '100%' }} 
                        value={val ?? 5} 
                        formatter={v => `${v}%`} 
                        parser={v => v.replace('%', '')} 
                        onChange={(v) => handleItemFieldChange(record.id, 'discountRate', v)} 
                    />
                );
            }
        },
        {
            title: '价格策略',
            dataIndex: 'strategyCode',
            width: 130,
            render: (val, record) => {
                if (isReadonly) return <span className="text-gray-700">{val || 'DEFAULT'}</span>;
                return (
                    <Button 
                        type="link" 
                        size="small"
                        onClick={() => handleShowStrategyDetail(record.strategyCode || 'DEFAULT')}
                    >
                        {val || 'DEFAULT'}
                    </Button>
                );
            }
        },
        { 
            title: (
                <Space size={4}>
                    <span>折后单价</span>
                    <Tooltip title="折后单价=标准单价*（1-优惠折扣率）">
                        <InfoCircleOutlined className="text-gray-400" style={{ cursor: 'pointer' }} />
                    </Tooltip>
                </Space>
            ),
            dataIndex: 'finalPrice', 
            width: 120, 
            align: 'right',
            render: (v) => <Text strong>¥{(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> 
        },
        { 
            title: '数量', 
            dataIndex: 'quantity', 
            width: 100,
            render: (val, record) => {
                if (isReadonly) return <span className="font-mono">{val}</span>;
                return (
                    <InputNumber 
                        min={1} 
                        precision={0} 
                        value={val} 
                        onChange={(v) => handleItemFieldChange(record.id, 'quantity', v)} 
                    />
                );
            }
        },
        { 
            title: '标准总金额', 
            width: 120, 
            align: 'right',
            render: (_, record) => {
                const total = (record.standardPrice || 0) * (record.quantity || 0);
                return <span className="font-mono text-gray-700">¥{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
            }
        },
        { 
            title: '折后总金额（不含税）', 
            dataIndex: 'amount', 
            width: 130, 
            align: 'right',
            render: (v) => <Text strong type="danger">¥{(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> 
        },
        {
            title: '折后总金额（含税）',
            width: 130,
            align: 'right',
            render: (_, record) => {
                const amt = record.amount || 0;
                const taxedAmt = amt * (1 + taxRate);
                return <Text strong style={{ color: '#d97706' }} className="font-mono">¥{taxedAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>;
            }
        },
        { 
            title: '备注', 
            dataIndex: 'remark', 
            width: 150,
            render: (val, record) => {
                if (isReadonly) return val || '-';
                return <Input value={val} onChange={(e) => handleItemFieldChange(record.id, 'remark', e.target.value)} />;
            }
        },
        { 
            title: '操作', 
            width: 60, 
            fixed: 'right',
            render: (_, record) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setItems(items.filter((item) => item.id !== record.id))} />
        }
    ];

    const getCustomColumns = () => [
        { title: '序号', width: 50, render: (_, __, i) => i + 1, fixed: 'left' },
        { 
            title: '定制品编码', 
            dataIndex: 'productCode', 
            width: 140,
            fixed: 'left',
            render: (val, record) => (
                <Input 
                    value={val || record.tempProductCode || '-'}
                    disabled 
                    readOnly 
                    className="bg-gray-50 font-mono text-xs"
                />
            )
        },
        { 
            title: '定制品名称', 
            dataIndex: 'productName', 
            width: 150,
            render: (val, record) => (
                <Input 
                    value={val || `定制产品-${record.id}`}
                    disabled 
                    readOnly 
                    className="bg-gray-50 text-xs"
                />
            )
        },
        { title: '规格', dataIndex: 'spec', width: 140, ellipsis: true },
        { title: '型号', dataIndex: 'model', width: 100, render: (v) => v || 'M-2026-LS' },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 140,
            render: (val, record) => {
                if (isReadonly) return <span className="text-gray-700 font-medium">{val || '标准属性'}</span>;
                return (
                    <Button 
                        size="small"
                        type="dashed"
                        onClick={() => {
                            const index = items.findIndex(i => i.id === record.id);
                            setPropertyModalOpen({ open: true, index, isGift: false });
                        }}
                    >
                        {val ? `属性: ${val}` : '选择属性'}
                    </Button>
                );
            }
        },
        {
            title: '替代料明细',
            dataIndex: 'substituteProductCode',
            width: 180,
            render: (val, record) => {
                const hasSubstitute = !!val;
                const codes = val ? val.split(',') : [];
                const names = record.substituteProductName ? record.substituteProductName.split(',') : [];
                if (isReadonly) {
                    return hasSubstitute ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className="w-full">
                            {codes.map((code, idx) => (
                                <div 
                                    key={code} 
                                    className="flex flex-col gap-0.5 px-2 py-1 bg-amber-50/65 border border-amber-100 rounded text-[10px] text-amber-700 font-medium leading-tight"
                                    style={{ borderLeft: '3px solid #d97706' }}
                                >
                                    <div className="flex items-center gap-1 w-full justify-between border-b border-amber-100/30 pb-0.5 mb-0.5">
                                        <span className="font-semibold text-amber-800 flex items-center gap-1">
                                            <SwapOutlined style={{ fontSize: '10px' }} className="shrink-0" />
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
                    ) : '-';
                }
                return (
                    <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                        {!hasSubstitute && (
                            <Button 
                                size="small" 
                                type="primary"
                                ghost
                                icon={<SwapOutlined />}
                                onClick={() => openSubstituteWizard(record)}
                                style={{ width: '100%', fontSize: '11px' }}
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
            dataIndex: 'category', 
            width: 100, 
            render: (val) => {
                const v = val || '定制成品';
                const colorMap = {
                    '定制成品': 'purple',
                    '成品': 'blue',
                    '半成品': 'orange',
                    '原材料': 'green',
                    '配件': 'cyan'
                };
                return (
                    <Tag color={colorMap[v] || 'purple'} className="m-0 border-none px-2.5 py-0.5 rounded font-medium text-xs">
                        {v}
                    </Tag>
                );
            }
        },
        { 
            title: '库存数量', 
            dataIndex: 'stockQty', 
            width: 90, 
            align: 'right', 
            render: (val) => <span className="font-mono text-gray-700">{val ?? 0}</span> 
        },
        { 
            title: '可用数量',
            dataIndex: 'availableQty', 
            width: 90, 
            align: 'right',
            render: (v) => <span className="font-mono text-blue-600">{v ?? 0}</span>
        },
        { 
            title: '占用数量', 
            dataIndex: 'occupiedQty', 
            width: 90, 
            align: 'right',
            render: (val, record) => {
                const stock = record.stockQty ?? 0;
                const avail = record.availableQty ?? 0;
                const occup = val ?? (stock - avail >= 0 ? stock - avail : 0);
                return <span className="font-mono text-gray-500">{occup}</span>;
            }
        },
        { 
            title: '在制数量', 
            dataIndex: 'wipQty', 
            width: 90, 
            align: 'right',
            render: (val, record) => {
                const wip = val ?? (record.id?.startsWith('NEW_') ? 0 : 15);
                return <span className="font-mono text-gray-500">{wip}</span>;
            }
        },
        { 
            title: '标准单价', 
            dataIndex: 'standardPrice', 
            width: 100, 
            align: 'right', 
            render: (v) => `¥${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
        },
        { 
            title: '市场指导价', 
            dataIndex: 'marketPrice', 
            width: 100, 
            align: 'right', 
            render: (v) => `¥${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
        },
        { 
            title: '底价', 
            dataIndex: 'floorPrice', 
            width: 100, 
            align: 'right', 
            render: (v) => `¥${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
        },
        { 
            title: '优惠折扣率', 
            dataIndex: 'discountRate', 
            width: 120,
            align: 'right',
            render: (val, record) => {
                if (isReadonly) return `${val ?? 5}%`;
                return (
                    <InputNumber 
                        min={0} 
                        max={100} 
                        style={{ width: '100%' }} 
                        value={val ?? 5} 
                        formatter={v => `${v}%`} 
                        parser={v => v.replace('%', '')} 
                        onChange={(v) => handleItemFieldChange(record.id, 'discountRate', v)} 
                    />
                );
            }
        },
        {
            title: '价格策略',
            dataIndex: 'strategyCode',
            width: 130,
            render: (val, record) => {
                if (isReadonly) return <span className="text-gray-700">{val || 'DEFAULT'}</span>;
                return (
                    <Button 
                        type="link" 
                        size="small"
                        onClick={() => handleShowStrategyDetail(record.strategyCode || 'DEFAULT')}
                    >
                        {val || 'DEFAULT'}
                    </Button>
                );
            }
        },
        { 
            title: (
                <Space size={4}>
                    <span>折后单价</span>
                    <Tooltip title="折后单价=标准单价*（1-优惠折扣率）">
                        <InfoCircleOutlined className="text-gray-400" style={{ cursor: 'pointer' }} />
                    </Tooltip>
                </Space>
            ),
            dataIndex: 'finalPrice', 
            width: 120, 
            align: 'right',
            render: (v) => <Text strong>¥{(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> 
        },
        { 
            title: '数量', 
            dataIndex: 'quantity', 
            width: 100,
            render: (val, record) => {
                if (isReadonly) return <span className="font-mono">{val}</span>;
                return (
                    <InputNumber 
                        min={1} 
                        precision={0} 
                        value={val} 
                        onChange={(v) => handleItemFieldChange(record.id, 'quantity', v)} 
                    />
                );
            }
        },
        { 
            title: '标准总金额', 
            width: 120, 
            align: 'right',
            render: (_, record) => {
                const total = (record.standardPrice || 0) * (record.quantity || 0);
                return <span className="font-mono text-gray-700">¥{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
            }
        },
        { 
            title: '折后总金额（不含税）', 
            dataIndex: 'amount', 
            width: 130, 
            align: 'right',
            render: (v) => <Text strong type="danger">¥{(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> 
        },
        {
            title: '折后总金额（含税）',
            width: 130,
            align: 'right',
            render: (_, record) => {
                const amt = record.amount || 0;
                const taxedAmt = amt * (1 + taxRate);
                return <Text strong style={{ color: '#d97706' }} className="font-mono">¥{taxedAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>;
            }
        },
        { 
            title: '备注', 
            dataIndex: 'remark', 
            width: 150,
            render: (val, record) => {
                if (isReadonly) return val || '-';
                return <Input value={val} onChange={(e) => handleItemFieldChange(record.id, 'remark', e.target.value)} />;
            }
        },
        { 
            title: '操作', 
            width: 60, 
            fixed: 'right',
            render: (_, record) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setItems(items.filter((item) => item.id !== record.id))} />
        }
    ];

    const giftColumns = useMemo(() => [
        { title: '勾选', width: 40, render: () => <Checkbox /> },
        { title: '序号', width: 50, render: (_, __, i) => i + 1 },
        { 
            title: '产品编码', 
            dataIndex: 'productCode', 
            width: 160,
            render: (val, record) => {
                if (isReadonly) return <span className="font-mono text-gray-700">{val || '-'}</span>;
                return (
                    <Select 
                        showSearch 
                        style={{ width: '100% '}} 
                        value={val}
                        onChange={(v) => handleProductChange(v, record.id, true)}
                        options={salableProducts.map(p => ({ label: p.code, value: p.code }))}
                    />
                );
            }
        },
        { 
            title: '产品名称', 
            dataIndex: 'productName', 
            width: 160,
            render: (val, record) => {
                if (isReadonly) return <span>{val || '-'}</span>;
                return (
                    <Select 
                        showSearch 
                        style={{ width: '100% '}} 
                        value={val}
                        onChange={(v) => handleProductChange(v, record.id, true)}
                        options={salableProducts.map(p => ({ label: p.name, value: p.name }))}
                    />
                );
            }
        },
        { title: '规格', dataIndex: 'spec', width: 140 },
        { title: '型号', dataIndex: 'model', width: 100, render: (v) => v || 'M-2026' },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 120,
            render: (val, record) => {
                if (isReadonly) return <span className="text-gray-700 font-medium">{val || '标准属性'}</span>;
                return (
                    <Button 
                        size="small"
                        type="dashed"
                        onClick={() => {
                            const index = giftItems.findIndex(i => i.id === record.id);
                            setPropertyModalOpen({ open: true, index, isGift: true });
                        }}
                    >
                        {val ? `属性: ${val}` : '选择属性'}
                    </Button>
                );
            }
        },
        { 
            title: '数量', 
            dataIndex: 'quantity', 
            width: 100,
            render: (val, record) => {
                if (isReadonly) return <span className="font-mono">{val}</span>;
                return <InputNumber min={1} precision={0} value={val} onChange={(v) => handleItemFieldChange(record.id, 'quantity', v, true)} />;
            }
        },
        { 
            title: '备注', 
            dataIndex: 'remark', 
            width: 150,
            render: (val, record) => {
                if (isReadonly) return val || '-';
                return <Input value={val} onChange={(e) => handleItemFieldChange(record.id, 'remark', e.target.value, true)} />;
            }
        },
        { 
            title: '操作', 
            width: 60,
            render: (_, record) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setGiftItems(giftItems.filter((item) => item.id !== record.id))} />
        }
    ], [isReadonly, salableProducts, giftItems]);

    const standardColumns = useMemo(() => {
        const cols = getStandardColumns();
        if (isReadonly) {
            return cols.filter(c => c.title !== '操作' && c.width !== 40);
        }
        return cols;
    }, [isReadonly, salableProducts, items]);

    const customColumns = useMemo(() => {
        const cols = getCustomColumns();
        if (isReadonly) {
            return cols.filter(c => c.title !== '操作' && c.width !== 40);
        }
        return cols;
    }, [isReadonly, items, selectedCustomer]);

    const activeGiftColumns = useMemo(() => {
        if (isReadonly) {
            return giftColumns.filter(c => c.title !== '操作' && c.title !== '勾选');
        }
        return giftColumns;
    }, [giftColumns, isReadonly]);

    const handleAuditSubmit = () => {
        form.validateFields(['auditResult', 'auditRemark']).then(values => {
            const res = values.auditResult;
            const rem = values.auditRemark;
            if (!res) {
                message.error('请选择审批操作');
                return;
            }
            if (!rem) {
                message.error('请填写审批意见');
                return;
            }
            const updatedRecord = {
                ...activeRecord,
                status: res === '审核通过' ? '已审核' : activeRecord.status,
                auditResult: res,
                approvalResult: res,
                auditRemark: rem,
                auditTime: new Date().toLocaleString(),
                auditor: '当前管理员'
            };
            message.success('处理成功');
            onSuccess(updatedRecord);
        });
    };

    const getModalTitle = () => {
        if (mode === 'detail') return `普通销售订单详情 - ${activeRecord?.orderNo || ''}`;
        if (mode === 'audit') return `审批普通销售订单 - ${activeRecord?.orderNo || ''}`;
        return activeRecord ? `编辑普通销售订单 - ${activeRecord.orderNo}` : '新增普通销售订单';
    };

    const handleSave = (isSubmit = false) => {
        form.validateFields().then(values => {
            if (items.length === 0) {
                message.error('请至少添加一个产品明细');
                return;
            }
            const orderData = {
                ...values,
                id: activeRecord?.id,
                items,
                giftItems,
                hasCustomProduct: items.some(i => i.isCustom),
                totalAmount: totalSummaries.orderTotal,
                paidAmount: activeRecord?.paidAmount || 0,
                status: isSubmit ? '待审核' : '草稿',
                orderDate: values.orderDate.format('YYYY-MM-DD'),
                expectDeliveryDate: values.expectDeliveryDate?.format('YYYY-MM-DD'),
                auditResult: isSubmit ? '待审核' : undefined
            };

            if (isSubmit) {
                Modal.confirm({
                    title: '提交审核',
                    content: '确认保存并提交该订单进行审核吗？',
                    onOk: () => onSuccess(orderData)
                });
            } else {
                onSuccess(orderData);
            }
        });
    };

    return (
        <Modal
            title={getModalTitle()}
            open={open}
            onCancel={handleClose}
            width={1200}
            centered
            forceRender
            footer={
                mode === 'detail' ? [
                    <Button key="close" type="primary" onClick={handleClose}>关闭</Button>
                ] : mode === 'audit' ? [
                    <Button key="cancel" onClick={handleClose}>取消</Button>,
                    <Button key="submit" type="primary" onClick={handleAuditSubmit}>提交审核</Button>
                ] : [
                    <Button key="cancel" onClick={handleClose}>取消</Button>,
                    <Button key="save" onClick={() => handleSave(false)}>保存</Button>,
                    <Button key="submit" type="primary" onClick={() => handleSave(true)}>保存并提交</Button>
                ]
            }
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={12}><Form.Item name="orderNo" label="销售订单号" rules={[{ required: true }]}><Input readOnly disabled /></Form.Item></Col>
                    <Col span={12}>
                        <Form.Item name="quotationNo" label="来源报价单号">
                            {isReadonly ? (
                                <Input readOnly disabled />
                            ) : (
                                <Input 
                                    readOnly 
                                    placeholder="点击选择报价单" 
                                    suffix={<Link onClick={() => setQuotationModalOpen(true)}>选择</Link>} 
                                    onClick={() => setQuotationModalOpen(true)}
                                    className="cursor-pointer"
                                />
                            )}
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item label="客户" required={!isReadonly}>
                            {isReadonly ? (
                                <Input readOnly disabled value={selectedCustomer ? `${selectedCustomer.code} / ${selectedCustomer.name}` : ''} />
                            ) : (
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input readOnly value={selectedCustomer ? `${selectedCustomer.code} / ${selectedCustomer.name}` : ''} />
                                    <Button type="primary" icon={<UserOutlined />} onClick={() => setCustomerModalOpen(true)}>选择客户</Button>
                                </Space.Compact>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={6}><Form.Item name="customerType" label="客户类型"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}><Form.Item name="settlementMethod" label="结算方式"><Input readOnly disabled /></Form.Item></Col>
                    
                    {form.getFieldValue('settlementMethod') === '月结' && (
                        <Col span={6}><Form.Item name="monthlyCycle" label="月结周期"><Input readOnly disabled /></Form.Item></Col>
                    )}
                    {form.getFieldValue('settlementMethod') === '预存' && (
                        <Col span={6}><Form.Item name="prepaidBalance" label="预存余额"><InputNumber readOnly disabled prefix="¥" precision={2} style={{ width: '100%' }} /></Form.Item></Col>
                    )}
                    
                    <Col span={6}><Form.Item name="orderDate" label="订单日期" rules={[{ required: true }]}><DatePicker style={{ width: '100% '}} disabled={isReadonly} /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item 
                            name="expectDeliveryDate" 
                            label="期望发货日期" 
                            rules={[{ required: true, message: '请选择期望发货日期' }]}
                        >
                            <DatePicker style={{ width: '100% '}} disabled={isReadonly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="subsidiary" label="项目 (子公司)" rules={[{ required: true }]}>
                            <Select disabled={isReadonly} options={[{ label: '总部', value: '总部' }, { label: '分公司A', value: '分公司A' }]} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="salesperson" label="业务员" rules={[{ required: true }]}>
                            <Select disabled={isReadonly} showSearch options={employees.map(e => ({ label: e.name, value: e.name }))} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="isCollectDeposit" label="是否收取定金" valuePropName="checked">
                            <Switch checkedChildren="是" unCheckedChildren="否" disabled={isReadonly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="depositRatio" label="定金比例">
                            <InputNumber 
                                min={0} 
                                max={100} 
                                formatter={v => `${v}%`} 
                                parser={v => v.replace('%', '')} 
                                style={{ width: '100%' }} 
                                disabled={isReadonly || !isCollectDeposit}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item 
                            name="includeInStockingPlan" 
                            label="纳入备货计划" 
                            valuePropName="checked"
                            tooltip="纳入备货计划表示生产备货需求的计算会计入该笔销量"
                        >
                            <Switch checkedChildren="是" unCheckedChildren="否" disabled={isReadonly} />
                        </Form.Item>
                    </Col>
                    
                    <Col span={6}>
                        <Form.Item label="是否存在定制产品">
                            <Select
                                value={items.some(i => i.isCustom) ? '是' : '否'}
                                disabled
                                className="bg-gray-50 text-gray-700 font-medium"
                                options={[
                                    { value: '是', label: '是' },
                                    { value: '否', label: '否' }
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    
                    <Col span={6}>
                        <Form.Item name="urgency" label="紧急程度" rules={[{ required: true, message: '请选择紧急程度' }]}>
                            <Select placeholder="选择紧急程度" disabled={isReadonly}>
                                <Select.Option value="紧急">紧急</Select.Option>
                                <Select.Option value="一般">一般</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    
                    <Col span={6}>
                        <Form.Item name="taxRate" label="税率">
                            <Input placeholder="输入税率，如 0.13 或 13%" disabled={isReadonly} />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mt-4 p-4 bg-white border border-gray-100 rounded-lg shadow-xs flex flex-col gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Space size={8}>
                                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                                <Title level={5} className="!m-0">标品明细</Title>
                                <span className="text-xs text-gray-400">标准品目录内常规物料明细</span>
                            </Space>
                            {!isReadonly && (
                                <Space>
                                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addStandardItem}>
                                        添加标品
                                    </Button>
                                    <Button 
                                        danger 
                                        size="small" 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => {
                                            const standardItemIds = items.filter(i => !i.isCustom).map(i => i.id);
                                            const toDelete = selectedRowKeys.filter(k => standardItemIds.includes(k));
                                            if (toDelete.length > 0) {
                                                setItems(items.filter(i => !toDelete.includes(i.id)));
                                                setSelectedRowKeys(selectedRowKeys.filter(k => !toDelete.includes(k)));
                                                message.success(`成功删除 ${toDelete.length} 项标品`);
                                            } else {
                                                message.warning('请先在表格左侧勾选要批量删除的标品');
                                            }
                                        }}
                                    >
                                        批量删除
                                    </Button>
                                </Space>
                            )}
                        </div>
                        <Table 
                            columns={standardColumns} 
                            dataSource={items.filter(item => !item.isCustom)} 
                            rowKey="id" 
                            size="small" 
                            pagination={false} 
                            scroll={{ x: 1950 }} 
                            rowSelection={isReadonly ? null : {
                                selectedRowKeys,
                                onChange: (keys) => {
                                    // Combine existing selection excluding current standard items, then add new standard selection
                                    const customIds = items.filter(i => i.isCustom).map(i => i.id);
                                    const keptKeys = selectedRowKeys.filter(k => customIds.includes(k));
                                    setSelectedRowKeys([...keptKeys, ...keys]);
                                }
                            }}
                            locale={{ emptyText: '暂无标品，点击“添加标品”录入数据' }}
                        />
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Space size={8}>
                                <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                                <Title level={5} className="!m-0">定制品明细</Title>
                                <span className="text-xs text-gray-400">根据标品BOM结构与替代料组配置的定制品明细</span>
                            </Space>
                            {!isReadonly && (
                                <Space>
                                    <Button type="primary" size="small" className="bg-amber-600 hover:bg-amber-500 border-amber-600" icon={<PlusOutlined />} onClick={addCustomItem}>
                                        添加定制品
                                    </Button>
                                    <Button 
                                        danger 
                                        size="small" 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => {
                                            const customItemIds = items.filter(i => i.isCustom).map(i => i.id);
                                            const toDelete = selectedRowKeys.filter(k => customItemIds.includes(k));
                                            if (toDelete.length > 0) {
                                                setItems(items.filter(i => !toDelete.includes(i.id)));
                                                setSelectedRowKeys(selectedRowKeys.filter(k => !toDelete.includes(k)));
                                                message.success(`成功删除 ${toDelete.length} 项定制品`);
                                            } else {
                                                message.warning('请先在表格左侧勾选要批量删除的定制品');
                                            }
                                        }}
                                    >
                                        批量删除
                                    </Button>
                                </Space>
                            )}
                        </div>
                        <Table 
                            columns={customColumns} 
                            dataSource={items.filter(item => item.isCustom)} 
                            rowKey="id" 
                            size="small" 
                            pagination={false} 
                            scroll={{ x: 1950 }} 
                            rowSelection={isReadonly ? null : {
                                selectedRowKeys,
                                onChange: (keys) => {
                                    // Combine existing selection excluding current custom items, then add new custom selection
                                    const standardIds = items.filter(i => !i.isCustom).map(i => i.id);
                                    const keptKeys = selectedRowKeys.filter(k => standardIds.includes(k));
                                    setSelectedRowKeys([...keptKeys, ...keys]);
                                }
                            }}
                            locale={{ emptyText: '暂无定制品，点击“添加定制品”并配置替代料结构即可录入数据' }}
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <Title level={5} className="!m-0">赠品明细</Title>
                        <Text type="secondary">赠品不参与金额计算，单价默认为0</Text>
                        {!isReadonly && <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => addItem(true)}>添加赠品</Button>}
                    </div>
                    <Table 
                        columns={activeGiftColumns} 
                        dataSource={giftItems} 
                        rowKey="id" 
                        size="small" 
                        pagination={false} 
                        scroll={{ x: 1000 }} 
                    />
                </div>

                <Row gutter={24} className="mt-6">
                    <Col span={14}>
                        <Form.Item name="productionRemark" label="生产备注">
                            <TextArea rows={2} placeholder="给生产车间的特殊说明" disabled={isReadonly} />
                        </Form.Item>
                        <Form.Item name="customerRemark" label="客户备注">
                            <TextArea rows={2} placeholder="显示在送货单上的客户备注" disabled={isReadonly} />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <div className="bg-gray-50 p-4 rounded text-right space-y-2 border border-gray-100">
                            <div>订单总额: <Text strong>¥{totalSummaries.productTotal.toFixed(2)}</Text></div>
                            <div>优惠金额: <Text type="secondary" className="text-green-600">- ¥{totalSummaries.totalSaving.toFixed(2)}</Text></div>
                            <div>订单不含税折后总额: <Text strong>¥{totalSummaries.discountedProductTotal.toFixed(2)}</Text></div>
                            <div>订单含税折后总额: <Text strong className="font-mono">¥{totalSummaries.taxedProductTotal.toFixed(2)}</Text></div>
                            <div className="flex justify-end items-center">
                                <span className="mr-2">其他费用:</span>
                                <Form.Item name="otherFee" noStyle><InputNumber precision={2} style={{ width: 120 }} onChange={() => {}} disabled={isReadonly} /></Form.Item>
                            </div>
                            {isCollectDeposit && (
                                <div>定金应收: <Text strong type="warning" className="text-amber-600">¥{totalSummaries.depositReceivable.toFixed(2)}</Text></div>
                            )}
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="text-2xl font-bold text-red-600">
                                订单应收总额: ¥{totalSummaries.orderTotal.toFixed(2)}
                            </div>
                            <div className="flex justify-end gap-4 text-gray-500">
                                <div>已收金额: ¥{(record?.paidAmount || 0).toFixed(2)}</div>
                                <div>待收金额: ¥{(totalSummaries.orderTotal - (record?.paidAmount || 0)).toFixed(2)}</div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {(mode === 'audit' || activeRecord?.auditResult || activeRecord?.approvalResult) && (
                    <div className="mt-6 p-4 bg-orange-50/50 rounded border border-orange-100/70">
                        <Divider titlePlacement="left"><span className="text-orange-850 font-medium font-sans">审核处理</span></Divider>
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item 
                                    name="auditResult" 
                                    label="审核操作" 
                                    rules={[{ required: true, message: '请选择审核操作' }]}
                                >
                                    <Select 
                                        placeholder="请选择" 
                                        disabled={mode !== 'audit'}
                                        options={[
                                            { label: '审核通过', value: '审核通过' },
                                            { label: '审核拒绝', value: '审核拒绝' }
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item 
                                    name="auditRemark" 
                                    label="审核意见" 
                                    rules={[{ required: true, message: '请填写审核意见' }]}
                                >
                                    <TextArea 
                                        rows={2} 
                                        placeholder="请在此输入审核意见..." 
                                        disabled={mode !== 'audit'}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        {activeRecord?.auditTime && (
                            <div className="text-xs text-gray-400 text-right mt-2 font-sans">
                                审核人: {activeRecord.auditor || '系统管理员'} | 审核时间: {activeRecord.auditTime}
                            </div>
                        )}
                    </div>
                )}
            </Form>

            <CustomerSelectModal 
                open={customerModalOpen} 
                onCancel={() => setCustomerModalOpen(false)} 
                onConfirm={handleCustomerConfirm} 
            />

            <QuotationSelectModal
                open={quotationModalOpen}
                onCancel={() => setQuotationModalOpen(false)}
                onConfirm={handleQuotationConfirm}
            />

            <PropertySelectModal
                open={propertyModalOpen.open}
                onCancel={() => setPropertyModalOpen({ open: false, index: null, isGift: false })}
                onConfirm={handlePropertyConfirm}
                productCode={
                    propertyModalOpen.isGift 
                    ? giftItems[propertyModalOpen.index]?.productCode 
                    : items[propertyModalOpen.index]?.productCode
                }
            />

            {/* Choose substitute modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <BranchesOutlined className="text-blue-500 text-lg" />
                        <span className="font-semibold text-gray-800">多层级可替换料选配向导 (订单定制)</span>
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
                            <Descriptions.Item label="适用客户等级">{selectedStrategyDetail.customerLevel || '全部'}</Descriptions.Item>
                            <Descriptions.Item label="适用客户区域">{selectedStrategyDetail.customerRegion || '不限'}</Descriptions.Item>
                            <Descriptions.Item label="产品信息">{selectedStrategyDetail.productInfo || '所有产品适用'}</Descriptions.Item>
                            <Descriptions.Item label="折扣系数">
                                <Text type="danger" strong>{selectedStrategyDetail.discountRate}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="生效日期">{selectedStrategyDetail.effectiveDate}</Descriptions.Item>
                            <Descriptions.Item label="失效日期">{selectedStrategyDetail.expiryDate}</Descriptions.Item>
                            <Descriptions.Item label="当前状态">
                                <Tag color={selectedStrategyDetail.status === '生效' ? 'green' : 'red'}>
                                    {selectedStrategyDetail.status || '生效'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="最后修改人">{selectedStrategyDetail.operator || '管理员'}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </Modal>
    );
};

export default NormalOrderFormModal;
