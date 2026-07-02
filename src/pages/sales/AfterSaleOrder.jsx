
import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import ReturnOrderList from './afterSales/ReturnOrderList';
import ExchangeOrderList from './afterSales/ExchangeOrderList';
import ReplenishOrderList from './afterSales/ReplenishOrderList';

const AfterSaleOrder = () => {
    return (
        <div className="p-4">
            <Card>
                <Tabs
                    defaultActiveKey="return"
                    items={[
                        {
                            key: 'return',
                            label: '退货单',
                            children: <ReturnOrderList />,
                        },
                        {
                            key: 'exchange',
                            label: <span><span className="text-red-500">（二期）</span>换货单</span>,
                            children: <ExchangeOrderList />,
                        },
                        {
                            key: 'replenish',
                            label: <span><span className="text-red-500">（二期）</span>补货单</span>,
                            children: <ReplenishOrderList />,
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default AfterSaleOrder;
