import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  User, 
  Hash, 
  Truck 
} from 'lucide-react';
import { Table, Button, Input, Empty, Tooltip, DatePicker } from 'antd';
import { Link } from 'react-router-dom';

const { RangePicker } = DatePicker;

// Simulated orders data representing various shipping lifecycle states
// Contains completely unshipped, completely shipped, and partially shipped orders with updated realistic fields
const INITIAL_ORDERS_DATA = [
  {
    orderNo: 'ORD20260501',
    customerName: '汉斯克家具集团',
    orderDate: '2026-05-10',
    deliveryDate: '2026-06-15',
    details: [
      { productCode: 'PROD-001', productName: '皮沙发', spec: '双人座', model: 'HSK-SF-01', description: '亲肤进口纳帕皮', color: '咖啡色', quantity: 5, shippedQty: 2, unshippedQty: 3, deliveryNoticeNo: 'DN2026051501', remarks: '客户特别强调皮质需无瑕疵', isShipped: '否' },
      { productCode: 'PROD-002', productName: '单人休闲椅', spec: '单人码', model: 'HSK-CH-03', description: '高回弹海绵布艺', color: '高级灰', quantity: 10, shippedQty: 0, unshippedQty: 10, deliveryNoticeNo: 'DN2026051502', remarks: '无', isShipped: '否' },
      { productCode: 'PROD-003', productName: '北欧长茶几', spec: '1200*600*450', model: 'HSK-TB-08', description: '实木多层板胡桃木贴皮', color: '胡桃木色', quantity: 2, shippedQty: 2, unshippedQty: 0, deliveryNoticeNo: 'DN2026051503', remarks: '随货附配件说明书', isShipped: '是' },
    ]
  },
  {
    orderNo: 'ORD20260502',
    customerName: '宜家家居采购中心',
    orderDate: '2026-05-12',
    deliveryDate: '2026-06-20',
    details: [
      { productCode: 'PROD-004', productName: 'L型办公桌', spec: '1400*700*750', model: 'IK-DSK-99', description: '双饰面E0级免漆板', color: '哑光白', quantity: 15, shippedQty: 5, unshippedQty: 10, deliveryNoticeNo: 'DN2026051801', remarks: '加急批量单，走绿色通道', isShipped: '否' },
      { productCode: 'PROD-005', productName: '人体工学网椅', spec: '高背可调', model: 'IK-CHR-12', description: '透气高弹力网布+尼龙脚', color: '睿智黑', quantity: 15, shippedQty: 0, unshippedQty: 15, deliveryNoticeNo: 'DN2026051802', remarks: '批量订单，检查气压杆规格', isShipped: '否' },
    ]
  },
  {
    orderNo: 'ORD20260503',
    customerName: '美克美家连锁旗舰店',
    orderDate: '2026-05-15',
    deliveryDate: '2026-06-10',
    details: [
      { productCode: 'PROD-006', productName: '实木双人床', spec: '1800*2000', model: 'MK-BRD-01', description: '北美进口白橡木主架', color: '原木色', quantity: 3, shippedQty: 3, unshippedQty: 0, deliveryNoticeNo: 'DN2026052001', remarks: '特制包装免拆洗', isShipped: '是' },
      { productCode: 'PROD-007', productName: '床头柜', spec: '500*400*550', model: 'MK-CAB-02', description: '双抽实木滑轨柜', color: '原木色', quantity: 6, shippedQty: 6, unshippedQty: 0, deliveryNoticeNo: 'DN2026052001', remarks: '无备注说明', isShipped: '是' },
    ]
  },
  {
    orderNo: 'ORD20260504',
    customerName: '尚品宅配定制华东仓',
    orderDate: '2026-05-18',
    deliveryDate: '2026-07-01',
    details: [
      { productCode: 'PROD-008', productName: '定制通顶衣柜', spec: '2400*2000*600', model: 'SP-WRD-24', description: '欧松板基材定制柜体', color: '金檀木色', quantity: 1, shippedQty: 0, unshippedQty: 1, deliveryNoticeNo: 'DN2026052101', remarks: '定制品明细数据回填', isShipped: '否' },
      { productCode: 'PROD-009', productName: '静音五金配件包', spec: '抽屉阻尼器+地阻', model: 'SP-HDW-05', description: '304不锈钢高承重铰链', color: '铬色', quantity: 1, shippedQty: 0, unshippedQty: 1, deliveryNoticeNo: 'DN2026052101', remarks: '配套定制衣柜合包发货', isShipped: '否' },
      { productCode: 'PROD-010', productName: '铝合金穿衣镜', spec: '1200*400-防爆', model: 'SP-MIR-11', description: '高清银镜带防爆底膜', color: '银镜', quantity: 1, shippedQty: 1, unshippedQty: 0, deliveryNoticeNo: 'DN2026052102', remarks: '玻璃易碎品，外箱贴红色警告标', isShipped: '是' },
    ]
  },
  {
    orderNo: 'ORD20260505',
    customerName: '红星美凯龙至尊Mall',
    orderDate: '2026-05-20',
    deliveryDate: '2026-06-30',
    details: [
      { productCode: 'PROD-011', productName: '轻奢真皮极简床', spec: '1800*2000', model: 'HX-BED-09', description: '头层牛皮床头靠背', color: '爱马仕橙', quantity: 4, shippedQty: 1, unshippedQty: 3, deliveryNoticeNo: 'DN2026052201', remarks: '展厅精品样板房专用', isShipped: '否' },
      { productCode: 'PROD-012', productName: '七区天然乳胶床垫', spec: '1800*2000*100', model: 'HX-MAT-07', description: '泰国进口高纯乳胶外罩针织布', color: '乳白色', quantity: 4, shippedQty: 1, unshippedQty: 3, deliveryNoticeNo: 'DN2026052201', remarks: '展厅样板，随床配套发运', isShipped: '否' },
      { productCode: 'PROD-013', productName: '尊享白鹅绒抱枕', spec: '48*74-中高枕', model: 'HX-PIL-15', description: '80支纯棉防羽布面料', color: '纯白', quantity: 8, shippedQty: 0, unshippedQty: 8, deliveryNoticeNo: 'DN2026052202', remarks: '促销赠品配发', isShipped: '否' },
    ]
  },
  {
    orderNo: 'ORD20260506',
    customerName: '欧派家居全屋定制中心',
    orderDate: '2026-05-22',
    deliveryDate: '2026-07-10',
    details: [
      { productCode: 'PROD-014', productName: '橱柜五彩门吊柜', spec: '800*400*350', model: 'OP-CAB-88', description: '钛铝合金包边晶钢门板', color: '闪银色', quantity: 2, shippedQty: 0, unshippedQty: 2, deliveryNoticeNo: 'DN2026052301', remarks: '精装工程订单，需附质检单', isShipped: '否' },
      { productCode: 'PROD-015', productName: '整体橱柜防潮地柜', spec: '1200*600*850', model: 'OP-LCB-92', description: '优质颗粒防潮板+高档石英石面', color: '浅灰', quantity: 2, shippedQty: 0, unshippedQty: 2, deliveryNoticeNo: 'DN2026052301', remarks: '开孔尺寸请对照厨具图纸', isShipped: '否' },
      { productCode: 'PROD-016', productName: '不锈钢台下盆水槽', spec: '780*430-纳米款', model: 'OP-SNK-10', description: 'SUS304一体拉伸消音水槽', color: '金属灰', quantity: 2, shippedQty: 2, unshippedQty: 0, deliveryNoticeNo: 'DN2026052302', remarks: '赠抽拉龙头与防臭落水系统', isShipped: '是' },
    ]
  },
  {
    orderNo: 'ORD20260507',
    customerName: '顾家家居华南运营中心',
    orderDate: '2026-05-23',
    deliveryDate: '2026-06-25',
    details: [
      { productCode: 'PROD-017', productName: '电动单人舱功能沙发', spec: '一键平躺/电动伸缩', model: 'GJ-SF-35', description: '高档皮质接触面+碳钢伸缩架', color: '雾霾蓝', quantity: 5, shippedQty: 1, unshippedQty: 4, deliveryNoticeNo: 'DN2026052401', remarks: '新款展厅促销订货', isShipped: '否' },
      { productCode: 'PROD-018', productName: '天鹅绒亲肤小抱枕', spec: '45*45-带枕芯', model: 'GJ-PIL-02', description: '超柔短毛绒外套+羽丝绒内胆', color: '亮黄色', quantity: 10, shippedQty: 10, unshippedQty: 0, deliveryNoticeNo: 'DN2026052402', remarks: '促销赠品，确保拉链顺滑', isShipped: '是' },
    ]
  },
  {
    orderNo: 'ORD20260508',
    customerName: '林氏家居生活馆',
    orderDate: '2026-05-24',
    deliveryDate: '2026-07-05',
    details: [
      { productCode: 'PROD-019', productName: '简约橡木三人沙发', spec: '三人座', model: 'LS-SF-22', description: '耐磨仿棉麻面料+高韧蛇形弹簧', color: '米白色', quantity: 3, shippedQty: 0, unshippedQty: 3, deliveryNoticeNo: 'DN2026052501', remarks: '工厂直接打包打托托运', isShipped: '否' },
      { productCode: 'PROD-020', productName: '岩板中岛餐桌', spec: '1600*900*750', model: 'LS-TB-16', description: '意大利进口雪花白高硬岩板', color: '爵士白/黑黑腿', quantity: 2, shippedQty: 0, unshippedQty: 2, deliveryNoticeNo: 'DN2026052501', remarks: '走专线物流大件运输', isShipped: '否' },
      { productCode: 'PROD-021', productName: '轻奢PU软包装餐椅', spec: '高回弹原生海绵', model: 'LS-CHR-50', description: 'PU耐磨皮饰面+碳素钢防滑脚', color: '摩卡色', quantity: 8, shippedQty: 0, unshippedQty: 8, deliveryNoticeNo: 'DN2026052501', remarks: '配桌成套发货，核对脚帽', isShipped: '否' },
    ]
  }
];

export default function UnshippedTrackingDashboard() {
  // Filter input states (held locally before pressing "查询")
  const [orderNoInput, setOrderNoInput] = useState('');
  const [customerInput, setCustomerInput] = useState('');
  const [dateRangeInput, setDateRangeInput] = useState(null);

  // Active query search states (applied to filter the list)
  const [orderNoSearch, setOrderNoSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [dateRangeSearch, setDateRangeSearch] = useState(null);

  // Trigger searching using input values
  const handleSearch = () => {
    setOrderNoSearch(orderNoInput);
    setCustomerSearch(customerInput);
    setDateRangeSearch(dateRangeInput);
  };

  // Handler to clear all filters
  const handleResetFilters = () => {
    setOrderNoInput('');
    setCustomerInput('');
    setDateRangeInput(null);
    setOrderNoSearch('');
    setCustomerSearch('');
    setDateRangeSearch(null);
  };

  // Memoized fully pre-processed list of UNSHIPPED (未发货) items
  // Already-shipped products MUST NEVER appear in any view.
  const unshippedDataset = useMemo(() => {
    const list = [];
    INITIAL_ORDERS_DATA.forEach(order => {
      order.details.forEach(item => {
        if (item.isShipped === '否') {
          list.push({
            ...item,
            orderNo: order.orderNo,
            customerName: order.customerName,
            orderDate: order.orderDate,
            deliveryDate: order.deliveryDate,
            uniqueId: `${order.orderNo}-${item.productCode}`
          });
        }
      });
    });
    return list;
  }, []);

  // Filter the unshipped items based on search terms (orderNo, customerName and Order Date Range)
  const filteredUnshippedDataset = useMemo(() => {
    return unshippedDataset.filter(item => {
      const matchOrder = !orderNoSearch || item.orderNo.toLowerCase().includes(orderNoSearch.trim().toLowerCase());
      const matchCustomer = !customerSearch || item.customerName.toLowerCase().includes(customerSearch.trim().toLowerCase());
      
      let matchDate = true;
      if (dateRangeSearch && dateRangeSearch[0] && dateRangeSearch[1]) {
        const startStr = dateRangeSearch[0].format('YYYY-MM-DD');
        const endStr = dateRangeSearch[1].format('YYYY-MM-DD');
        matchDate = item.orderDate >= startStr && item.orderDate <= endStr;
      }

      return matchOrder && matchCustomer && matchDate;
    });
  }, [unshippedDataset, orderNoSearch, customerSearch, dateRangeSearch]);

  // Antd Table columns definition for 'Global View' (全局未发货清单)
  const globalTableColumns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 140,
      render: (text) => (
        <span className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          {text}
        </span>
      ),
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      render: (text) => (
        <span className="font-medium text-slate-700 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {text}
        </span>
      ),
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (text) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          {text}
        </span>
      ),
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      render: (text) => <span className="font-semibold text-[#1f4a8c]">{text}</span>,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
      render: (text) => <span className="text-slate-600 text-xs font-mono">{text || '—'}</span>,
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 120,
      render: (text) => <span className="text-slate-600 text-xs">{text || '—'}</span>,
    },
    {
      title: '订单数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (num) => <span className="font-mono text-sm font-semibold text-slate-700">{num}</span>,
    },
    {
      title: '已发货数量',
      dataIndex: 'shippedQty',
      key: 'shippedQty',
      width: 110,
      align: 'right',
      render: (num) => <span className="font-mono text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{num || 0}</span>,
    },
    {
      title: '未发货数量',
      dataIndex: 'unshippedQty',
      key: 'unshippedQty',
      width: 110,
      align: 'right',
      render: (num) => <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{num}</span>,
    },
    {
      title: '期望发货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      render: (text) => <span className="text-slate-600 text-xs font-mono">{text || '—'}</span>,
    },
    {
      title: '出库单号',
      dataIndex: 'deliveryNoticeNo',
      key: 'deliveryNoticeNo',
      width: 155,
      render: (text) => (
        text ? (
          <Link to="/outbound" className="text-[#1f4a8c] hover:text-blue-700 font-mono text-xs font-semibold hover:underline bg-blue-50/50 hover:bg-blue-100/60 px-2.5 py-1 rounded transition-colors border border-blue-100">
            {text}
          </Link>
        ) : <span className="text-slate-400 font-mono text-xs">—</span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-xs text-slate-500 italic">
            {text === '无' || !text ? '—' : text}
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div id="unshipped-dashboard-container" className="bg-[#f0f2f6] min-h-screen py-6 px-4 md:px-8 w-full">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* =============== 二、顶部信息栏 =============== */}
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-[#1f4a8c] tracking-tight flex items-center gap-2">
              <Truck className="w-8 h-8 text-[#1f4a8c]" />
              未发货产品追踪看板
            </h1>
            <p className="text-slate-500 text-sm">
              基于订单明细 • 展示所有未发货产品
            </p>
          </div>
        </div>

        {/* =============== 四、筛选栏 =============== */}
        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="w-full sm:w-[180px]">
              <Input
                placeholder="订单编号"
                value={orderNoInput}
                onChange={(e) => setOrderNoInput(e.target.value)}
                prefix={<Search className="w-4 h-4 text-slate-400" />}
                className="rounded-lg border-slate-200 hover:border-[#1f4a8c] focus:border-[#1f4a8c]"
                style={{ height: '36px' }}
                allowClear
              />
            </div>
            <div className="w-full sm:w-[220px]">
              <Input
                placeholder="客户名称"
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
                prefix={<User className="w-4 h-4 text-slate-400" />}
                className="rounded-lg border-slate-200 hover:border-[#1f4a8c] focus:border-[#1f4a8c]"
                style={{ height: '36px' }}
                allowClear
              />
            </div>
            <div className="w-full sm:w-[280px]">
              <RangePicker
                placeholder={['开始订货日期', '结束订货日期']}
                value={dateRangeInput}
                onChange={(dates) => setDateRangeInput(dates)}
                className="rounded-lg border-slate-200 hover:border-[#1f4a8c] focus:border-[#1f4a8c] w-full"
                style={{ height: '36px' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                onClick={handleSearch}
                icon={<Search className="w-4 h-4" />}
                className="flex items-center gap-1.5 rounded-lg bg-[#1f4a8c] border-[#1f4a8c] hover:bg-blue-700 hover:border-blue-700 text-white"
                style={{ height: '36px' }}
              >
                查询
              </Button>
              <Button
                onClick={handleResetFilters}
                icon={<RotateCcw className="w-4 h-4" />}
                className="flex items-center gap-1.5 rounded-lg border-slate-200 text-slate-600 hover:text-[#1f4a8c] hover:border-[#1f4a8c]"
                style={{ height: '36px' }}
              >
                重置
              </Button>
            </div>
          </div>

          <div className="shrink-0 flex items-center xl:self-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs bg-sky-50 text-[#1f4a8c] border border-sky-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
              未发货产品总数: <span className="font-mono text-base font-black">{filteredUnshippedDataset.length}</span>
            </span>
          </div>
        </div>

        {/* =============== 六 / 七 / 八 / 九、数据内容区域 =============== */}
        {filteredUnshippedDataset.length === 0 ? (
          <div className="bg-white rounded-[24px] p-16 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-slate-700 font-semibold text-lg">暂无未发货产品</span>
                  <p className="text-slate-400 text-sm max-w-[340px]">
                    在当前的筛选条件下，没有发现任何未发货的明细行。请尝试更换或重置订单及订货日期。
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          /* =============== 六、全局未发货清单视图（表格形式） =============== */
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
            <Table
              dataSource={filteredUnshippedDataset}
              columns={globalTableColumns}
              rowKey="uniqueId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条未发货明细`,
                className: "px-6 py-4 border-t border-slate-100"
              }}
              scroll={{ x: 'max-content' }}
              className="unshipped-global-table font-sans"
              rowClassName="hover:bg-slate-50/50 transition-colors"
            />
          </div>
        )}

      </div>
    </div>
  );
}
