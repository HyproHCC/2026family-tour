import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Flame,
  Search,
  Users
} from 'lucide-react';
import { MEALS_DATA, MealInfo, DishItem } from '../data/tripData';
import { addOrder, getOrders, OrderItem } from '../store/orderStore';
import confetti from 'canvas-confetti';

interface Props {
  currentUser: string;
  onRequestUser: () => void;
  selectedMealKey: string;
  onSelectMealKey: (key: string) => void;
  onGoToStats: () => void;
}

export const OrderView: React.FC<Props> = ({
  currentUser,
  onRequestUser,
  selectedMealKey,
  onSelectMealKey,
  onGoToStats
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 火鍋客製化彈窗狀態
  const [hotpotModalOpen, setHotpotModalOpen] = useState(false);
  const [selectedMeat, setSelectedMeat] = useState<{ id: string; name: string; price: number } | null>(null);
  const [selectedSoup, setSelectedSoup] = useState<string>('牧場自產鮮奶湯底 (最推薦)');
  const [selectedSide, setSelectedSide] = useState<string>('白飯');

  const currentMeal = MEALS_DATA.find((m) => m.dateKey === selectedMealKey) || MEALS_DATA[0];
  const allOrders = getOrders();
  const currentMealOrders = allOrders.filter((o) => o.mealKey === selectedMealKey);
  const myMealOrders = currentMealOrders.filter((o) => o.userName === currentUser);

  // 取得所有分類
  const categories = ['全部', ...(currentMeal.dishes ? Array.from(new Set(currentMeal.dishes.map((d) => d.category))) : [])];

  const filteredDishes = (currentMeal.dishes || []).filter((d) => {
    const matchesCat = activeCategory === '全部' || d.category === activeCategory;
    const matchesSearch = !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddDish = (dish: DishItem) => {
    if (!currentUser) {
      onRequestUser();
      return;
    }
    addOrder({
      mealKey: selectedMealKey,
      userName: currentUser,
      itemId: dish.id,
      itemName: dish.name,
      price: dish.price,
      quantity: 1,
      details: dish.note ? `備註: ${dish.note}` : undefined
    });

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.85 }
    });
  };

  const handleConfirmHotpot = () => {
    if (!currentUser) {
      onRequestUser();
      return;
    }
    if (!selectedMeat) return;

    addOrder({
      mealKey: selectedMealKey,
      userName: currentUser,
      itemId: selectedMeat.id,
      itemName: selectedMeat.name,
      price: selectedMeat.price,
      quantity: 1,
      details: `湯底: ${selectedSoup} | 附餐: ${selectedSide}`
    });

    setHotpotModalOpen(false);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.85 }
    });
  };

  return (
    <div>
      {/* 餐廳切換選單 Tab */}
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
              onClick={() => {
                onSelectMealKey(meal.dateKey);
                setActiveCategory('全部');
                setSearchTerm('');
              }}
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
                {meal.dateKey === '1031_lunch' && '10/31 週六中午'}
                {meal.dateKey === '1031_dinner' && '10/31 週六晚餐'}
                {meal.dateKey === '1101_lunch' && '11/01 週日中午'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meal.restaurant.split('（')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* 餐廳資訊 Card */}
      <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '10px',
                  background: currentMeal.mealType.includes('合菜') ? '#fef3c7' : '#fee2e2',
                  color: currentMeal.mealType.includes('合菜') ? '#92400e' : '#991b1b'
                }}
              >
                {currentMeal.mealType}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{currentMeal.timing}</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '6px' }}>
              {currentMeal.restaurant}
            </h3>
          </div>

          {/* 原始截圖菜單按鈕 */}
          {currentMeal.originalMenuImages && currentMeal.originalMenuImages.length > 0 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPreviewImage(currentMeal.originalMenuImages![0])}
            >
              <ImageIcon size={14} />
              查看原始菜單截圖
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px', lineHeight: 1.4 }}>
          {currentMeal.note}
        </p>

        {/* 目前身分提示 */}
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: currentUser ? '#f0fdf4' : '#fffbeb',
            border: currentUser ? '1px solid #bbf7d0' : '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem'
          }}
        >
          <div>
            {currentUser ? (
              <span>
                目前點餐者：<strong style={{ color: '#166534' }}>{currentUser}</strong>
              </span>
            ) : (
              <span style={{ color: '#b45309' }}>尚未選取身分，點擊右方登入稱謂：</span>
            )}
          </div>
          <button
            onClick={onRequestUser}
            className="btn btn-sm"
            style={{
              padding: '4px 10px',
              background: currentUser ? '#e2e8f0' : '#f59e0b',
              color: currentUser ? '#334155' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem'
            }}
          >
            {currentUser ? '切換成員' : '點此選擇身分'}
          </button>
        </div>
      </div>

      {/* 依餐點類型分別呈現 UI */}
      {currentMeal.hotpot ? (
        /* 火鍋模式 */
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} color="#dc2626" />
              個人套餐選擇 (含肉品、菜盤、附餐)
            </h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>點擊下方套餐進行自選</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {currentMeal.hotpot.meats.map((meat) => {
              const myCount = myMealOrders.filter((o) => o.itemId === meat.id).reduce((sum, o) => sum + o.quantity, 0);
              const totalCount = currentMealOrders.filter((o) => o.itemId === meat.id).reduce((sum, o) => sum + o.quantity, 0);

              return (
                <div
                  key={meat.id}
                  className="card"
                  style={{
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{meat.name}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', marginTop: '4px' }}>
                      ${meat.price}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {totalCount > 0 ? `整桌共已點 ${totalCount} 份` : '尚未有人點選'}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedMeat(meat);
                        setHotpotModalOpen(true);
                      }}
                    >
                      <Plus size={14} />
                      選擇湯底與副食 ({myCount > 0 ? `我點了 ${myCount}` : '點餐'})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 合菜模式 */
        <div>
          {/* 搜尋與分類篩選 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="搜尋菜名（如：封鴨、蝦球、客家小炒...）"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* 分類標籤 */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '14px'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  background: activeCategory === cat ? '#2563eb' : '#e2e8f0',
                  color: activeCategory === cat ? 'white' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 菜品清單列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredDishes.map((dish) => {
              const myCount = myMealOrders.filter((o) => o.itemId === dish.id).reduce((sum, o) => sum + o.quantity, 0);
              const totalCount = currentMealOrders.filter((o) => o.itemId === dish.id).reduce((sum, o) => sum + o.quantity, 0);

              return (
                <div
                  key={dish.id}
                  className="card"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    margin: 0
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dish.name}</span>
                      {dish.isVegetarian && (
                        <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px' }}>
                          素
                        </span>
                      )}
                      {dish.note && (
                        <span style={{ fontSize: '0.75rem', color: '#ea580c', background: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}>
                          {dish.note}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb' }}>
                        ${dish.price}
                      </span>
                      {dish.unit && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/{dish.unit}</span>}
                      {totalCount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>
                          全家已點 {totalCount} 份
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 加點按鈕 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {myCount > 0 && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>
                        我: {myCount}
                      </span>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddDish(dish)}
                      style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
                      title="加一份"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 底部浮動快速統計 Bar */}
      {currentMealOrders.length > 0 && (
        <div
          style={{
            position: 'sticky',
            bottom: '75px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            padding: '12px 18px',
            borderRadius: '16px',
            marginTop: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              此餐共點了 {currentMealOrders.reduce((sum, o) => sum + o.quantity, 0)} 道菜
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              總計：$
              {currentMealOrders.reduce((sum, o) => sum + o.price * o.quantity, 0) *
                (1 + (currentMeal.serviceChargePercent || 0) / 100)}
              {currentMeal.serviceChargePercent && (
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#cbd5e1', marginLeft: '4px' }}>
                  (含10%服務費)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onGoToStats}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            查看明細與統計 →
          </button>
        </div>
      )}

      {/* 火鍋湯底與副食選擇 Modal */}
      {hotpotModalOpen && selectedMeat && currentMeal.hotpot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              {selectedMeat.name} (${selectedMeat.price})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
              請為【{currentUser || '您'}】選擇這份火鍋套餐的湯底與副食：
            </p>

            {/* 湯底 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>1. 選擇湯底：</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentMeal.hotpot.soups.map((s) => (
                  <label
                    key={s}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: selectedSoup === s ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: selectedSoup === s ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="soup"
                      checked={selectedSoup === s}
                      onChange={() => setSelectedSoup(s)}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: selectedSoup === s ? 700 : 500 }}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 副食 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>2. 選擇附餐：</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {currentMeal.hotpot.sides.map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setSelectedSide(side)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: selectedSide === side ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: selectedSide === side ? '#eff6ff' : '#ffffff',
                      color: selectedSide === side ? '#2563eb' : '#334155',
                      fontWeight: selectedSide === side ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setHotpotModalOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleConfirmHotpot}
              >
                確認加入點餐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 菜單截圖預覽 Modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '90vw', padding: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700 }}>菜單原始截圖</span>
              <button
                onClick={() => setPreviewImage(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <img
              src={previewImage}
              alt="Menu preview"
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
