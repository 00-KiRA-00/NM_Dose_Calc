import { useState, useEffect } from 'react';
import { getAllNuclides, RADIOPHARMACEUTICALS } from '../data/radiopharmaceuticals';
import { decayFactor } from '../utils/calculations';
import '../styles/tabs.css';

export default function CalculatorTab() {
  // For decay correction
  const [decayNuclide, setDecayNuclide] = useState('18F');
  const [halfLifeHours, setHalfLifeHours] = useState(1.8295);
  
  // For I-131: date only
  const [decayDate1, setDecayDate1] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [decayDate2, setDecayDate2] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  
  // For other nuclides: time only (HH:MM)
  const [decayTime1, setDecayTime1] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(11, 16); // "HH:MM"
  });
  const [decayTime2, setDecayTime2] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(11, 16);
  });
  
  const [decayActivityIn, setDecayActivityIn] = useState('');
  const [decayActivityOut, setDecayActivityOut] = useState(null);

  // Stock & desired dose (unchanged)
  const [stockActivity, setStockActivity] = useState('');
  const [stockVolume, setStockVolume] = useState('');
  const [desiredActivity, setDesiredActivity] = useState('');
  const [volumeToDraw, setVolumeToDraw] = useState(null);
  const [rac, setRac] = useState(null);

  const [error, setError] = useState('');

  const handleNuclideChange = (nuclide) => {
    setDecayNuclide(nuclide);
    const tracer = RADIOPHARMACEUTICALS.find(t => t.nuclide === nuclide);
    if (tracer) {
      setHalfLifeHours(tracer.halfLifeHours);
    }
  };

  const isIodine131 = decayNuclide === '131I';

  const handleCalculateVolume = () => {
    setError('');
    const stockAct = parseFloat(stockActivity);
    const stockVol = parseFloat(stockVolume);
    const desired = parseFloat(desiredActivity);
    if (isNaN(stockAct) || stockAct <= 0) {
      setError('Enter positive stock activity (mCi).');
      return;
    }
    if (isNaN(stockVol) || stockVol <= 0) {
      setError('Enter positive stock volume (mL).');
      return;
    }
    if (isNaN(desired) || desired <= 0) {
      setError('Enter positive desired patient dose (mCi).');
      return;
    }
    const concentration = stockAct / stockVol;
    setRac(concentration);
    const neededVol = desired / concentration;
    setVolumeToDraw(neededVol);
  };

  const handleDecayCalculate = () => {
    setError('');
    const actIn = parseFloat(decayActivityIn);
    if (isNaN(actIn) || actIn <= 0) {
      setError('Enter positive activity (mCi).');
      return;
    }

    let t1, t2;
    const now = new Date();
    const currentDateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

    if (isIodine131) {
      if (!decayDate1 || !decayDate2) {
        setError('Please select both dates.');
        return;
      }
      // Use date at midnight local time
      t1 = new Date(decayDate1 + 'T00:00:00');
      t2 = new Date(decayDate2 + 'T00:00:00');
    } else {
      if (!decayTime1 || !decayTime2) {
        setError('Please select both times.');
        return;
      }
      // Combine current date with user-provided time
      t1 = new Date(`${currentDateStr}T${decayTime1}:00`);
      t2 = new Date(`${currentDateStr}T${decayTime2}:00`);
    }

    if (isNaN(t1) || isNaN(t2)) {
      setError('Invalid date/time.');
      return;
    }

    const diffHours = (t2 - t1) / (1000 * 60 * 60);
    const factor = decayFactor(diffHours, halfLifeHours);
    setDecayActivityOut(actIn * factor);
  };

  const nuclides = getAllNuclides();

  return (
    <div className="tab-content calculator-tab">
      <h2>Pharmacy Dose Calculator</h2>
      <p className="section-description">
        Calculate volume to draw from a stock vial (simple concentration, no decay). 
      </p>

      {/* Stock Vial & Desired Dose (unchanged) */}
      <div className="form-section">
        <h3>Stock Vial & Desired Dose</h3>
        <div className="form-group">
          <label>Stock Activity (mCi)</label>
          <input type="number" value={stockActivity} onChange={(e) => setStockActivity(e.target.value)} placeholder="e.g., 50" step="1" />
        </div>
        <div className="form-group">
          <label>Stock Volume (mL)</label>
          <input type="number" value={stockVolume} onChange={(e) => setStockVolume(e.target.value)} placeholder="e.g., 5" step="0.1" />
        </div>
        <div className="form-group">
          <label>Desired Patient Dose (mCi)</label>
          <input type="number" value={desiredActivity} onChange={(e) => setDesiredActivity(e.target.value)} placeholder="e.g., 10" step="0.5" />
        </div>
        <button className="calculate-button" onClick={handleCalculateVolume} style={{ backgroundColor: '#0a7ea4', marginTop: 8 }}>
          Calculate Volume to Draw
        </button>
        {volumeToDraw !== null && (
          <div className="result-section" style={{ marginTop: 16 }}>
            <div className="dose-box" style={{ padding: '12px' }}>
              <span className="dose-label">VOLUME TO DRAW</span>
              <span className="dose-value">{volumeToDraw.toFixed(2)} mL</span>
            </div>
            <div className="info-box">
              <p><strong>Concentration (RAC):</strong> {rac.toFixed(4)} mCi/mL</p>
              <p><strong>Formula:</strong> {desiredActivity} mCi ÷ ({stockActivity} mCi / {stockVolume} mL)</p>
            </div>
          </div>
        )}
      </div>

      {/* Decay Correction – conditional date/time inputs */}
      <div className="form-section">
        <h3>Decay Correction</h3>
        <p className="section-description">
          Correct activity for radioactive decay between two times.
        </p>

        <div className="form-group">
          <label>Radionuclide (for half‑life)</label>
          <select value={decayNuclide} onChange={(e) => handleNuclideChange(e.target.value)}>
            {nuclides.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="info-box" style={{ marginBottom: 12 }}>
          Half‑life: <strong>{halfLifeHours.toFixed(2)} hours</strong>
          {isIodine131 ? (
            <span> (I‑131 – use dates, time ignored)</span>
          ) : (
            <span> (use times only – assumes same current date)</span>
          )}
        </div>

        <div className="form-group">
          <label>Initial {isIodine131 ? 'Date' : 'Time (HH:MM)'}</label>
          {isIodine131 ? (
            <input type="date" value={decayDate1} onChange={(e) => setDecayDate1(e.target.value)} />
          ) : (
            <input type="time" value={decayTime1} onChange={(e) => setDecayTime1(e.target.value)} step="60" />
          )}
        </div>

        <div className="form-group">
          <label>Initial Activity (mCi)</label>
          <input type="number" value={decayActivityIn} onChange={(e) => setDecayActivityIn(e.target.value)} placeholder="e.g., 50" step="1" />
        </div>

        <div className="form-group">
          <label>Target {isIodine131 ? 'Date' : 'Time (HH:MM)'}</label>
          {isIodine131 ? (
            <input type="date" value={decayDate2} onChange={(e) => setDecayDate2(e.target.value)} />
          ) : (
            <input type="time" value={decayTime2} onChange={(e) => setDecayTime2(e.target.value)} step="60" />
          )}
        </div>

        <button className="calculate-button" onClick={handleDecayCalculate} style={{ backgroundColor: '#0a7ea4' }}>
          Calculate Activity at Target Time
        </button>
        {decayActivityOut !== null && (
          <div className="result-section" style={{ marginTop: 12 }}>
            <div className="dose-box" style={{ padding: '12px' }}>
              <span className="dose-label">Activity at target time</span>
              <span className="dose-value">{decayActivityOut.toFixed(2)} mCi</span>
            </div>
            <div className="info-box">
              Time difference: {((isIodine131 
                ? new Date(decayDate2) - new Date(decayDate1) 
                : (() => {
                    const now = new Date();
                    const currentDate = now.toISOString().slice(0, 10);
                    const t1 = new Date(`${currentDate}T${decayTime1}:00`);
                    const t2 = new Date(`${currentDate}T${decayTime2}:00`);
                    return t2 - t1;
                  })()) / (1000 * 60)).toFixed(0)} minutes
            </div>
          </div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}