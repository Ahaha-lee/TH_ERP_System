
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
                            label: '换货单',
                            children: <ExchangeOrderList />,
                        },
                        {
                            key: 'replenish',
                            label: '补货单',
                            children: <ReplenishOrderList />,
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default AfterSaleOrder;
