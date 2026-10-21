import React, { useState, useEffect } from 'react';
import { Calendar, Utensils, PieChart, UserCheck, MapPin } from 'lucide-react';
import { ItineraryView } from './components/ItineraryView';
import { OrderView } from './components/OrderView';
import { StatsView } from './components/StatsView';
import { UserSelectorModal } from './components/UserSelectorModal';
import { getLocalUser, setLocalUser } from './store/orderStore';

export function App() {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'order' | 'stats'>('itinerary');
  const [currentUser, setCurrentUser] = useState<string>(() => getLocalUser());
  const [userModalOpen, setUserModalOpen] = useState(() => !getLocalUser());
  const [selectedMealKey, setSelectedMealKey] = useState<string>('1031_lunch');

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'family_trip_current_user_v1') {
        setCurrentUser(getLocalUser());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSelectUser = (name: string) => {
    setCurrentUser(name);
    setLocalUser(name);
    setUserModalOpen(false);
  };

  const handleGoToOrder = (mealKey?: string) => {
    if (mealKey) setSelectedMealKey(mealKey);
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStats = () => {
    setActiveTab('stats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* 頂部 Header */}
      <header className="app-header">
        <div className="header-top">
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} />
              苗栗 • 2026/10/31 - 11/01
            </div>
            <h1 className="header-title">2026 苗栗家庭旅行</h1>
          </div>

          {/* 身分切換 Badge */}
          <button
            className="user-badge"
            onClick={() => setUserModalOpen(true)}
            title="點擊切換點餐者"
          >
            <UserCheck size={16} />
            <span>{currentUser || '點我設定稱謂'}</span>
          </button>
        </div>
      </header>

      {/* 主要內容區 */}
      <main className="container">
        {activeTab === 'itinerary' && <ItineraryView onGoToOrder={handleGoToOrder} />}
        {activeTab === 'order' && (
          <OrderView
            currentUser={currentUser}
            onRequestUser={() => setUserModalOpen(true)}
            selectedMealKey={selectedMealKey}
            onSelectMealKey={setSelectedMealKey}
            onGoToStats={handleGoToStats}
          />
        )}
        {activeTab === 'stats' && (
          <StatsView
            selectedMealKey={selectedMealKey}
            onSelectMealKey={setSelectedMealKey}
            onGoToOrder={() => setActiveTab('order')}
          />
        )}
      </main>

      {/* 底部導覽列 */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('itinerary');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Calendar size={22} />
          <span>行程瀏覽</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'order' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('order');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Utensils size={22} />
          <span>點菜系統</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('stats');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <PieChart size={22} />
          <span>金額統計</span>
        </button>
      </nav>

      {/* 使用者選擇彈窗 */}
      {userModalOpen && (
        <UserSelectorModal
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          onClose={() => setUserModalOpen(false)}
          allowClose={!!currentUser}
        />
      )}
    </div>
  );
}

export default App;
