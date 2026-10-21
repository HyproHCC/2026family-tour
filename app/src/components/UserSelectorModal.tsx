import React, { useState } from 'react';
import { User, Check, Sparkles } from 'lucide-react';
import { DEFAULT_MEMBERS } from '../data/tripData';

interface Props {
  currentUser: string;
  onSelectUser: (name: string) => void;
  onClose?: () => void;
  allowClose?: boolean;
}

export const UserSelectorModal: React.FC<Props> = ({
  currentUser,
  onSelectUser,
  onClose,
  allowClose = true
}) => {
  const [customName, setCustomName] = useState('');

  const handleSelect = (name: string) => {
    if (!name.trim()) return;
    onSelectUser(name.trim());
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: '#eff6ff',
              color: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}
          >
            <User size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
            請選擇或輸入您的稱謂
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            登入後，點菜紀錄會直接標記您的名字並即時統計金額
          </p>
        </div>

        {/* 常用成員快速點選 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
            快速選擇家族成員：
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {DEFAULT_MEMBERS.map((m) => {
              const isSelected = currentUser === m;
              return (
                <button
                  key={m}
                  onClick={() => handleSelect(m)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    color: isSelected ? '#2563eb' : '#1e293b',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  {isSelected && <Check size={16} />}
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* 自行輸入 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
            或者自行輸入稱呼：
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="例如：小姑姑、表哥..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSelect(customName);
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button
              className="btn btn-primary"
              disabled={!customName.trim()}
              onClick={() => handleSelect(customName)}
              style={{ padding: '10px 16px' }}
            >
              確定
            </button>
          </div>
        </div>

        {allowClose && onClose && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              稍後再選
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
