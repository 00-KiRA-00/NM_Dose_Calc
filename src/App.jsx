import { useState } from 'react';
import './App.css';
import HomeTab from './tabs/HomeTab';
import CalculatorTab from './tabs/CalculatorTab';  // new
import SettingsTab from './tabs/SettingsTab';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState([]);

  const addToHistory = (calculation) => {
    setHistory([calculation, ...history].slice(0, 100));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>NM Dose Helper</h1>
        <p className="subtitle">Automated pediatric dosing + decay calculator</p>
      </header>

      <main className="app-content">
        {activeTab === 'home' && <HomeTab onCalculationSaved={addToHistory} />}
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'settings' && <SettingsTab history={history} onClearHistory={() => setHistory([])} />}
      </main>

      <nav className="tab-bar">
        <button className={`tab-button ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <span className="tab-icon">🏠</span><span className="tab-label">Home</span>
        </button>
        <button className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => setActiveTab('calculator')}>
          <span className="tab-icon">📟</span><span className="tab-label">Calculator</span>
        </button>
        <button className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <span className="tab-icon">⚙️</span><span className="tab-label">Settings</span>
        </button>
      </nav>

      <footer className="app-footer">
        <p>⚠️ <strong>Disclaimer:</strong> For reference only. Always verify doses against your institution's protocols.</p>
      </footer>
    </div>
  );
}

export default App;