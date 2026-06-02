import { useState, useEffect } from 'react';
import { getAllNuclides, getTracersByNuclide } from '../data/radiopharmaceuticals';
import { 
  calculateBaseDoseMci, 
  calculatePediatricDose, 
  PEDIATRIC_RULES,
  getAgeWarning,
  requiredInitialActivity
} from '../utils/calculations';
import { getWaitingTime, getTargetDateTimeFromNow } from '../utils/waitingTimes';
import '../styles/tabs.css';

export default function HomeTab({ onCalculationSaved }) {
  // ========== Patient Information ==========
  const [weight, setWeight] = useState('70');
  const [ageValue, setAgeValue] = useState('');
  const [ageUnit, setAgeUnit] = useState('years');
  const [height, setHeight] = useState('');

  // ========== Tracer Selection ==========
  const [selectedNuclide, setSelectedNuclide] = useState('18F');
  const [selectedTracerId, setSelectedTracerId] = useState('');
  const [availableTracers, setAvailableTracers] = useState([]);

  // ========== Dose Calculation Result ==========
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // ========== Decay Correction State ==========
  const [referenceType, setReferenceType] = useState('admin'); // 'admin' or 'scan'
  const [referenceDateTime, setReferenceDateTime] = useState('');
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [decayResult, setDecayResult] = useState(null);

  // ========== Effects ==========
  useEffect(() => {
    const tracers = getTracersByNuclide(selectedNuclide);
    setAvailableTracers(tracers);
    setSelectedTracerId(tracers.length > 0 ? tracers[0].id : '');
  }, [selectedNuclide]);

  // Prefill reference time with current time when "use current time" is checked
  useEffect(() => {
    if (useCurrentTime) {
      const now = new Date();
      setReferenceDateTime(now.toISOString().slice(0, 16));
    }
  }, [useCurrentTime]);

  // ========== Helper: Age Conversion ==========
  const getAgeInYearsAndMonths = () => {
    if (!ageValue) return { years: null, months: null };
    const num = parseFloat(ageValue);
    if (isNaN(num)) return { years: null, months: null };
    if (ageUnit === 'years') return { years: num, months: num * 12 };
    return { years: num / 12, months: num };
  };

  // ========== Automated Rule Selection ==========
  const determineAutomatedRule = (weightKg, heightCm, ageYears, ageMonths) => {
    if (heightCm && heightCm > 0) return PEDIATRIC_RULES.BSA;
    if (ageMonths && ageMonths > 0 && ageMonths < 24) return PEDIATRIC_RULES.SOLOMON_FRIED;
    if (ageYears !== null && ageYears >= 0 && ageYears < 18) return PEDIATRIC_RULES.EANM;
    return PEDIATRIC_RULES.WEBSTER;
  };

  // ========== Main Dose Calculation ==========
  const handleCalculate = () => {
    setError('');
    setDecayResult(null); // clear previous decay result

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight (kg)');
      return;
    }

    const tracer = availableTracers.find(t => t.id === selectedTracerId);
    if (!tracer) {
      setError('Please select a tracer');
      return;
    }

    const heightCmVal = height ? parseFloat(height) : null;
    const { years: ageYearsVal, months: ageMonthsVal } = getAgeInYearsAndMonths();

    // Adult Webster + caps
    const { nominalMci, finalMci: websterCappedMci, factor: websterFactor, capped, capReason } = 
      calculateBaseDoseMci(tracer, weightNum);

    const selectedRule = determineAutomatedRule(weightNum, heightCmVal, ageYearsVal, ageMonthsVal);

    let validationError = null;
    if (selectedRule === PEDIATRIC_RULES.BSA && (!heightCmVal || heightCmVal <= 0))
      validationError = 'Height is required for BSA dosing.';
    else if (selectedRule === PEDIATRIC_RULES.SOLOMON_FRIED && (!ageMonthsVal || ageMonthsVal <= 0))
      validationError = 'Age in months is required for Solomon Fried rule.';
    if (validationError) {
      setError(validationError);
      return;
    }

    let finalDoseMci = websterCappedMci;
    let pediatricFactor = 1.0;
    let ruleUsed = selectedRule;
    let pediatricApplied = false;

    if (selectedRule !== PEDIATRIC_RULES.WEBSTER) {
      try {
        const pedsResult = calculatePediatricDose(
          websterCappedMci, weightNum, ageYearsVal, selectedRule, heightCmVal, ageMonthsVal, tracer.id
        );
        finalDoseMci = pedsResult.finalDose;
        pediatricFactor = pedsResult.factor;
        ruleUsed = pedsResult.ruleUsed;
        pediatricApplied = true;
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    const ageWarning = (ageYearsVal !== null && ageYearsVal >= 0) ? getAgeWarning(ageYearsVal) : null;

    const resultData = {
      tracer,
      patientWeight: weightNum,
      patientAgeYears: ageYearsVal,
      patientAgeMonths: ageMonthsVal,
      patientHeight: heightCmVal,
      nominalMci,
      websterCappedMci,
      finalMci: finalDoseMci,
      websterFactor,
      capped,
      capReason,
      pediatricApplied,
      pediatricRule: ruleUsed,
      pediatricFactor,
      ageWarning,
      timestamp: new Date().toLocaleString()
    };
    setResult(resultData);
    onCalculationSaved(resultData);
  };

  // ========== Decay Correction Calculation ==========
  const handleDecayCalculate = () => {
    if (!result) {
      setError('Please calculate a dose first (the recommended dose is used).');
      return;
    }

    const tracer = result.tracer;
    const waiting = getWaitingTime(tracer.id);
    if (!waiting || waiting.minutes === undefined) {
      setError('No waiting time data available for this tracer.');
      return;
    }

    const waitHours = waiting.minutes / 60;

    let refTime;
    if (useCurrentTime) {
      refTime = new Date();
    } else {
      if (!referenceDateTime) {
        setError('Please select a reference date/time or use current time.');
        return;
      }
      refTime = new Date(referenceDateTime);
      if (isNaN(refTime.getTime())) {
        setError('Invalid date/time.');
        return;
      }
    }

    const recommendedDose = result.finalMci;
    let adminActivity, scanActivity;
    let explanation = '';

    if (referenceType === 'admin') {
      // Reference time = administration time
      adminActivity = recommendedDose;
      const scanTime = new Date(refTime.getTime() + waiting.minutes * 60 * 1000);
      const decayFactorValue = Math.exp(-Math.LN2 * waitHours / tracer.halfLifeHours);
      scanActivity = adminActivity * decayFactorValue;
      explanation = `You administer ${adminActivity.toFixed(2)} mCi at ${refTime.toLocaleString()}. At scan time (${scanTime.toLocaleString()}), after ${waiting.minutes} min of decay, the activity will be ${scanActivity.toFixed(2)} mCi.`;
    } else {
      // Reference time = scan time
      scanActivity = recommendedDose;
      const adminTime = new Date(refTime.getTime() - waiting.minutes * 60 * 1000);
      const decayFactorValue = Math.exp(-Math.LN2 * waitHours / tracer.halfLifeHours);
      adminActivity = scanActivity / decayFactorValue;
      explanation = `To have ${scanActivity.toFixed(2)} mCi at scan time (${refTime.toLocaleString()}), you need to administer ${adminActivity.toFixed(2)} mCi at ${adminTime.toLocaleString()} (${waiting.minutes} min before scan).`;
    }

    setDecayResult({
      adminActivity,
      scanActivity,
      adminTime: referenceType === 'admin' ? refTime : new Date(refTime.getTime() - waiting.minutes * 60 * 1000),
      scanTime: referenceType === 'scan' ? refTime : new Date(refTime.getTime() + waiting.minutes * 60 * 1000),
      waitingMinutes: waiting.minutes,
      waitingRange: waiting.range,
      halfLife: tracer.halfLifeHours,
      decayFactor: Math.exp(-Math.LN2 * waitHours / tracer.halfLifeHours),
      explanation,
      tracerName: tracer.name,
      referenceType,
      recommendedDose
    });
  };

  const nuclides = getAllNuclides();

  // ========== JSX ==========
  return (
    <div className="tab-content home-tab">
      {/* Patient Information */}
      <div className="form-section">
        <h2>Patient Information</h2>
        <div className="form-group">
          <label>Weight (kg) *</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" min="1" max="200" />
        </div>
        <div className="form-group">
          <label>Height (cm) – for BSA (optional)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 165" />
        </div>
        <div className="form-group">
          <label>Age</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input type="number" value={ageValue} onChange={(e) => setAgeValue(e.target.value)} placeholder="Enter age" min="0" style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '8px', background: '#f0f0f0', padding: '4px', borderRadius: '8px' }}>
              <button type="button" onClick={() => setAgeUnit('years')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: ageUnit === 'years' ? '#0a7ea4' : 'transparent', color: ageUnit === 'years' ? 'white' : '#333', cursor: 'pointer' }}>Years</button>
              <button type="button" onClick={() => setAgeUnit('months')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: ageUnit === 'months' ? '#0a7ea4' : 'transparent', color: ageUnit === 'months' ? 'white' : '#333', cursor: 'pointer' }}>Months</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracer Selection */}
      <div className="form-section">
        <h2>Tracer Selection</h2>
        <div className="form-group">
          <label>Radionuclide</label>
          <select value={selectedNuclide} onChange={(e) => setSelectedNuclide(e.target.value)}>
            {nuclides.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Tracer</label>
          <select value={selectedTracerId} onChange={(e) => setSelectedTracerId(e.target.value)}>
            {availableTracers.map(t => <option key={t.id} value={t.id}>{t.name} – {t.indication}</option>)}
          </select>
        </div>
      </div>

      {/* Automated rule info */}
      <div className="info-box" style={{ marginBottom: 20, backgroundColor: '#e8f0fe' }}>
        <strong>ℹ️ Automated pediatric rule:</strong><br />
        • Height → BSA &nbsp;|&nbsp; • Months &lt;24 → Solomon Fried &nbsp;|&nbsp; • Years &lt;18 → EANM (FDG: 39% reduction) &nbsp;|&nbsp; • Else → Webster
      </div>

      {error && <div className="error-message">{error}</div>}

      <button className="calculate-button" onClick={handleCalculate}>Calculate Dose</button>

      {/* Dose Result */}
      {result && (
        <div className="result-section">
          <h2>Calculated Dose</h2>
          <div className="dose-display">
            <div className="dose-box"><span className="dose-label">Activity (mCi)</span><span className="dose-value">{result.finalMci.toFixed(2)}</span></div>
          </div>
          {result.capped && <div className="warning-box">⚠️ {result.capReason}</div>}
          {result.ageWarning && <div className="warning-box pediatric">⚠️ {result.ageWarning}</div>}
          {result.pediatricApplied && (
            <div className="info-box" style={{ backgroundColor: '#e8f0fe' }}>
              <strong>Automatically applied rule:</strong> {result.pediatricRule}<br />
              Adjustment factor: {result.pediatricFactor.toFixed(3)}x
            </div>
          )}
          <div className="details-section">
            <h3>Details</h3>
            <div className="details-grid">
              <div className="detail-item"><span className="detail-label">Tracer</span><span className="detail-value">{result.tracer.name}</span></div>
              <div className="detail-item"><span className="detail-label">Webster factor</span><span className="detail-value">{result.websterFactor.toFixed(3)}</span></div>
              <div className="detail-item"><span className="detail-label">Nominal (adult)</span><span className="detail-value">{result.nominalMci.toFixed(2)} mCi</span></div>
              <div className="detail-item"><span className="detail-label">After Webster caps</span><span className="detail-value">{result.websterCappedMci.toFixed(2)} mCi</span></div>
              {result.patientHeight && <div className="detail-item"><span className="detail-label">Height</span><span className="detail-value">{result.patientHeight} cm</span></div>}
              <div className="detail-item"><span className="detail-label">Reference range</span><span className="detail-value">{result.tracer.minMci.toFixed(1)} – {result.tracer.maxMci.toFixed(1)} mCi</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Decay Correction Section - NEW VERSION */}
      <div className="form-section" style={{ marginTop: 30 }}>
        <h2>Decay Correction – Time‑of‑dose planning</h2>
        <div className="info-box" style={{ marginBottom: 16, backgroundColor: '#fff3e0' }}>
          <strong>ℹ️ Using the recommended dose from above ({result ? `${result.finalMci.toFixed(2)} mCi` : '—'})</strong><br />
          Choose whether that dose is the <strong>administration activity</strong> or the <strong>activity at scan time</strong>, and specify the reference time. The app will compute the activity at the other time.
        </div>

        <div className="form-group">
          <label>Recommended dose (from calculation) is the:</label>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="radio" value="admin" checked={referenceType === 'admin'} onChange={() => setReferenceType('admin')} />
              Administration activity (injected dose)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="radio" value="scan" checked={referenceType === 'scan'} onChange={() => setReferenceType('scan')} />
              Activity at scan time (desired)
            </label>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" checked={useCurrentTime} onChange={(e) => setUseCurrentTime(e.target.checked)} />
            Use current date & time as reference
          </label>
          {!useCurrentTime && (
            <input
              type="datetime-local"
              value={referenceDateTime}
              onChange={(e) => setReferenceDateTime(e.target.value)}
              style={{ width: '100%', marginTop: '8px' }}
            />
          )}
          <small style={{ display: 'block', marginTop: 4, color: '#687076' }}>
            {referenceType === 'admin'
              ? 'Reference time = when you give the injection.'
              : 'Reference time = when the scan is performed.'}
          </small>
        </div>

        <div className="form-group">
          <label>Recommended waiting time for this tracer</label>
          <input
            type="text"
            value={selectedTracerId && getWaitingTime(selectedTracerId)
              ? `${getWaitingTime(selectedTracerId).minutes} minutes (range: ${getWaitingTime(selectedTracerId).range})`
              : '—'}
            disabled
            style={{ background: '#f5f5f5' }}
          />
        </div>

        <button
          className="calculate-button"
          onClick={handleDecayCalculate}
          style={{ backgroundColor: '#e67e22', marginTop: 8 }}
          disabled={!result}
        >
          Calculate Required Activity
        </button>

        {decayResult && (
          <div className="result-section" style={{ marginTop: 16 }}>
            <h3>Decay‑Corrected Plan</h3>
            <div className="details-grid">
              <div className="detail-item"><span className="detail-label">Tracer</span><span className="detail-value">{decayResult.tracerName}</span></div>
              <div className="detail-item"><span className="detail-label">Half‑life</span><span className="detail-value">{decayResult.halfLife.toFixed(2)} hours</span></div>
              <div className="detail-item"><span className="detail-label">Waiting time</span><span className="detail-value">{decayResult.waitingMinutes} min (range: {decayResult.waitingRange})</span></div>
              <div className="detail-item"><span className="detail-label">Decay factor</span><span className="detail-value">{decayResult.decayFactor.toFixed(4)}</span></div>
              <div className="detail-item"><span className="detail-label"><strong>Administration activity</strong></span><span className="detail-value" style={{ fontSize: '16px', fontWeight: 'bold', color: '#e67e22' }}>{decayResult.adminActivity.toFixed(2)} mCi</span></div>
              <div className="detail-item"><span className="detail-label"><strong>Activity at scan</strong></span><span className="detail-value" style={{ fontSize: '16px', fontWeight: 'bold', color: '#e67e22' }}>{decayResult.scanActivity.toFixed(2)} mCi</span></div>
              <div className="detail-item"><span className="detail-label">Administration time</span><span className="detail-value">{decayResult.adminTime.toLocaleString()}</span></div>
              <div className="detail-item"><span className="detail-label">Scan time</span><span className="detail-value">{decayResult.scanTime.toLocaleString()}</span></div>
            </div>
            <div className="info-box" style={{ marginTop: 12, backgroundColor: '#f0f8ff' }}>
              {decayResult.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

