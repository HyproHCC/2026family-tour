import React from 'react';
import { Clock, MapPin, Phone, ExternalLink, Compass } from 'lucide-react';
import { ITINERARY_DATA, DayPlan, ItineraryItem } from '../data/tripData';

interface Props {
  onGoToOrder?: (mealKey: string) => void;
}

export const ItineraryView: React.FC<Props> = ({ onGoToOrder }) => {
  return (
    <div>
      {/* 頂部標語 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #fde68a',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <div style={{ fontSize: '2rem' }}>🐮</div>
        <div>
          <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1rem' }}>
            2026/10/31 - 11/01 苗栗家庭秋季旅行
          </div>
          <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
            客家文化手作體驗、飛牛牧場宿營、在地招牌美食饗宴
          </div>
        </div>
      </div>

      {ITINERARY_DATA.map((day: DayPlan, dayIdx: number) => (
        <div key={day.date} style={{ marginBottom: '28px' }}>
          {/* 日期 Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e2e8f0'
            }}
          >
            <div>
              <span
                style={{
                  background: dayIdx === 0 ? '#2563eb' : '#059669',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginRight: '8px'
                }}
              >
                Day {dayIdx + 1}
              </span>
              <strong style={{ fontSize: '1.1rem' }}>
                {day.date} ({day.weekday})
              </strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{day.title}</div>
          </div>

          {/* 時間軸列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {day.items.map((item: ItineraryItem) => {
              const isLunch1031 = item.id === 'day1-2';
              const isDinner1031 = item.id === 'day1-4';
              const isLunch1101 = item.id === 'day2-3';

              return (
                <div key={item.id} className="card" style={{ position: 'relative' }}>
                  {/* 時間與標題 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#2563eb',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          marginBottom: '4px'
                        }}
                      >
                        <Clock size={16} />
                        {item.time}
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        {item.title}
                      </h4>
                    </div>

                    {/* 地圖快速導航 */}
                    {item.mapQuery && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          item.mapQuery
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ textDecoration: 'none', gap: '4px' }}
                      >
                        <Compass size={14} color="#2563eb" />
                        導航
                      </a>
                    )}
                  </div>

                  {/* 地點資訊 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#475569',
                      fontSize: '0.85rem',
                      marginBottom: '10px'
                    }}
                  >
                    <MapPin size={14} color="#64748b" />
                    {item.location}
                  </div>

                  {/* 電話與營業時間 */}
                  {(item.phone || item.hours) && (
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '10px',
                        color: '#334155'
                      }}
                    >
                      {item.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} />
                          電話：<a href={`tel:${item.phone.split('/')[0].trim()}`}>{item.phone}</a>
                        </div>
                      )}
                      {item.hours && <div>營業時間：{item.hours}</div>}
                    </div>
                  )}

                  {/* 說明要點 */}
                  <div style={{ marginBottom: '12px' }}>
                    {item.description.map((desc, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          fontSize: '0.875rem',
                          color: '#334155',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '6px'
                        }}
                      >
                        <span style={{ color: '#94a3b8' }}>•</span>
                        <span>{desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* 標籤 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 點餐跳轉按鈕 (如果是餐點) */}
                  {(isLunch1031 || isDinner1031 || isLunch1101) && onGoToOrder && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => {
                          if (isLunch1031) onGoToOrder('1031_lunch');
                          if (isDinner1031) onGoToOrder('1031_dinner');
                          if (isLunch1101) onGoToOrder('1101_lunch');
                        }}
                      >
                        🍽️ 查看此餐廳菜單並點菜 →
                      </button>
                    </div>
                  )}

                  {/* 相關連結 */}
                  {item.link && (
                    <div style={{ marginTop: '8px' }}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.8rem',
                          color: '#2563eb',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={13} />
                        景點/食記詳細部落格介紹
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
