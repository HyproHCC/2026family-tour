import React, { useState } from 'react';
import {
  Users,
  UtensilsCrossed,
  Trash2,
  Plus,
  Minus,
  Calculator,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';
import { MEALS_DATA, MealInfo } from '../data/tripData';
import {
  getOrders,
  updateOrderQty,
  removeOrder,
  clearMealOrders,
  OrderItem
} from '../store/orderStore';

interface Props {
  selectedMealKey: string;
  onSelectMealKey: (key: string) => void;
  onGoToOrder: () => void;
}

export const StatsView: React.FC<Props> = ({
  selectedMealKey,
  onSelectMealKey,
  onGoToOrder
}) => {
  const [copied, setCopied] = useState(false);
  const currentMeal = MEALS_DATA.find((m) => m.dateKey === selectedMealKey) || MEALS_DATA[0];
  const allOrders = getOrders();
  const mealOrders = allOrders.filter((o) => o.mealKey === selectedMealKey);

  // 1. 依「菜品」彙總統計 (整桌清單)
  interface DishSummary {
    itemId: string;
    itemName: string;
    price: number;
    totalQty: number;
    orderedBy: { [userName: string]: number };
    detailsList: string[];
  }

  const dishMap: { [key: string]: DishSummary } = {};
  mealOrders.forEach((o) => {
    const key = o.itemId + (o.details ? `_${o.details}` : '');
    if (!dishMap[key]) {
      dishMap[key] = {
        itemId: o.itemId,
        itemName: o.itemName,
        price: o.price,
        totalQty: 0,
        orderedBy: {},
        detailsList: []
      };
    }
    dishMap[key].totalQty += o.quantity;
    dishMap[key].orderedBy[o.userName] = (dishMap[key].orderedBy[o.userName] || 0) + o.quantity;
    if (o.details && !dishMap[key].detailsList.includes(o.details)) {
      dishMap[key].detailsList.push(o.details);
    }
  });

  const dishSummaries = Object.values(dishMap);

  // 2. 依「個人」統計金額
  interface UserSummary {
    userName: string;
    items: { itemName: string; price: number; quantity: number; details?: string }[];
    subtotal: number;
  }

  const userMap: { [name: string]: UserSummary } = {};
  mealOrders.forEach((o) => {
    if (!userMap[o.userName]) {
      userMap[o.userName] = {
        userName: o.userName,
        items: [],
        subtotal: 0
      };
    }
    userMap[o.userName].items.push({
      itemName: o.itemName,
      price: o.price,
      quantity: o.quantity,
      details: o.details
    });
    userMap[o.userName].subtotal += o.price * o.quantity;
  });

  const userSummaries = Object.values(userMap);

  // 金額計算
  const subtotal = mealOrders.reduce((sum, o) => sum + o.price * o.quantity, 0);
  const serviceChargeRate = (currentMeal.serviceChargePercent || 0) / 100;
  const serviceCharge = Math.round(subtotal * serviceChargeRate);
  const grandTotal = subtotal + serviceCharge;

  // 複製文字清單分享到 LINE / 家族群組
  const handleCopySummary = () => {
    let text = `【${currentMeal.restaurant}】家族點餐統計\n`;
    text += `用餐時段：${currentMeal.timing}\n\n`;
    text += `📋【整桌點菜清單】\n`;
    dishSummaries.forEach((d) => {
      const who = Object.entries(d.orderedBy)
        .map(([u, q]) => `${u}x${q}`)
        .join(', ');
      text += `• ${d.itemName} x ${d.totalQty} (點餐: ${who})\n`;
      if (d.detailsList.length > 0) {
        text += `  └ ${d.detailsList.join(' / ')}\n`;
      }
    });

    text += `\n💰【金額統計】\n`;
    text += `菜色原價：$${subtotal}\n`;
    if (serviceCharge > 0) {
      text += `服務費(10%)：$${serviceCharge}\n`;
    }
    text += `總計金額：$${grandTotal}\n\n`;

    text += `👤【每人明細】\n`;
    userSummaries.forEach((u) => {
      const personalWithTax = Math.round(u.subtotal * (1 + serviceChargeRate));
      text += `• ${u.userName}：$${personalWithTax} (${u.items.map((i) => i.itemName + 'x' + i.quantity).join('、')})\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm(`確定要清空【${currentMeal.restaurant}】的所有點餐資料嗎？`)) {
      clearMealOrders(selectedMealKey);
    }
  };

  return (
    <div>
      {/* 餐廳切換 Tab */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        {MEALS_DATA.map((meal) => {
          const isSelected = meal.dateKey === selectedMealKey;
          return (
            <button
              key={meal.id}
              onClick={() => onSelectMealKey(meal.dateKey)}
              style={{
                padding: '10px 6px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: isSelected ? '#eff6ff' : '#ffffff',
                color: isSelected ? '#1d4ed8' : '#475569',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {meal.dateKey === '1031_lunch' && '10/31 午餐'}
                {meal.dateKey === '1031_dinner' && '10/31 晚餐'}
                {meal.dateKey === '1101_lunch' && '11/01 午餐'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meal.restaurant.split('（')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* 總結算卡片 */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {currentMeal.timing} • 結算統計
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>
              {currentMeal.restaurant}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>總結算金額</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
              ${grandTotal}
            </div>
          </div>
        </div>

        {/* 費用拆解 */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #334155',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}
        >
          <div>
            <div style={{ color: '#94a3b8' }}>菜色原價</div>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>${subtotal}</div>
          </div>
          <div>
            <div style={{ color: '#94a3b8' }}>服務費 (10%)</div>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>
              {serviceCharge > 0 ? `$${serviceCharge}` : '無'}
            </div>
          </div>
          <div>
            <div style={{ color: '#94a3b8' }}>已點道數</div>
            <div style={{ fontWeight: 700, marginTop: '2px' }}>
              {dishSummaries.reduce((sum, d) => sum + d.totalQty, 0)} 道
            </div>
          </div>
        </div>

        {/* 複製與重設操作列 */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button
            onClick={handleCopySummary}
            className="btn btn-primary"
            style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? '已複製到剪貼簿！' : '複製文字清單傳 LINE'}
          </button>
          {mealOrders.length > 0 && (
            <button
              onClick={handleClear}
              className="btn btn-outline"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                color: '#fca5a5',
                fontSize: '0.85rem',
                padding: '8px 12px'
              }}
            >
              <Trash2 size={15} />
              清空重置
            </button>
          )}
        </div>
      </div>

      {mealOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 18px' }}>
          <UtensilsCrossed size={48} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>
            目前此餐廳尚無任何點餐紀錄
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
            大家可以點擊下方按鈕前往菜單挑選喜愛的菜色！
          </p>
          <button
            onClick={onGoToOrder}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            立即前往點菜 →
          </button>
        </div>
      ) : (
        <>
          {/* 整桌出菜明細表 */}
          <div style={{ marginBottom: '24px' }}>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📋 整桌向店家點單總表 ({dishSummaries.length} 種品項)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dishSummaries.map((dish, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '12px 14px',
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {dish.itemName}
                    </div>
                    {dish.detailsList.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                        {dish.detailsList.join(' / ')}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      誰點的：
                      {Object.entries(dish.orderedBy).map(([user, q]) => (
                        <span
                          key={user}
                          style={{
                            display: 'inline-block',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            marginRight: '4px',
                            fontWeight: 600
                          }}
                        >
                          {user} x{q}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>
                      x {dish.totalQty}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      ${dish.price * dish.totalQty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 各成員個人金額明細 */}
          <div style={{ marginBottom: '24px' }}>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Users size={18} color="#2563eb" />
              家族成員各自點餐與應分擔金額 ({userSummaries.length} 位成員)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {userSummaries.map((user) => {
                const userWithTax = Math.round(user.subtotal * (1 + serviceChargeRate));
                const userOrders = mealOrders.filter((o) => o.userName === user.userName);

                return (
                  <div key={user.userName} className="card" style={{ padding: '14px', margin: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#0f172a',
                            background: '#f1f5f9',
                            padding: '3px 10px',
                            borderRadius: '12px'
                          }}
                        >
                          {user.userName}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          共點了 {user.items.reduce((s, i) => s + i.quantity, 0)} 項
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#16a34a' }}>
                        ${userWithTax}
                      </div>
                    </div>

                    {/* 明細清單 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {userOrders.map((ord) => (
                        <div
                          key={ord.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div>
                            <span>{ord.itemName}</span>
                            {ord.details && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>
                                ({ord.details})
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#64748b' }}>${ord.price}</span>
                            {/* 增減與刪除 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={() => updateOrderQty(ord.id, -1)}
                                style={{
                                  border: '1px solid #cbd5e1',
                                  background: 'white',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '24px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Minus size={12} />
                              </button>
                              <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                                {ord.quantity}
                              </span>
                              <button
                                onClick={() => updateOrderQty(ord.id, 1)}
                                style={{
                                  border: '1px solid #cbd5e1',
                                  background: 'white',
                                  borderRadius: '4px',
                                  width: '24px',
                                  height: '24px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
