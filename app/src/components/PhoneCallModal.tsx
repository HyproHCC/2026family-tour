import React from 'react';
import { Phone, X } from 'lucide-react';

interface Props {
  title: string;
  phoneString: string;
  onClose: () => void;
}

export const PhoneCallModal: React.FC<Props> = ({ title, phoneString, onClose }) => {
  const numbers = phoneString
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Phone size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>撥打電話</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {numbers.map((num) => {
            const cleanNum = num.replace(/[^\d+]/g, '');
            return (
              <a
                key={num}
                href={`tel:${cleanNum}`}
                className="btn btn-primary"
                style={{
                  background: '#16a34a',
                  color: 'white',
                  textDecoration: 'none',
                  justifyContent: 'center',
                  fontSize: '1.05rem',
                  padding: '12px 16px',
                  borderRadius: '12px'
                }}
              >
                <Phone size={18} />
                撥打 {num}
              </a>
            );
          })}
        </div>

        <div style={{ marginTop: '14px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', color: '#64748b' }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
