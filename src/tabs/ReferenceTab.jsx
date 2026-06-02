import { useState, useMemo } from 'react';
import { RADIOPHARMACEUTICALS, getAllNuclides } from '../data/radiopharmaceuticals';
import '../styles/tabs.css';

export default function ReferenceTab() {
  const [searchText, setSearchText] = useState('');
  const [selectedNuclide, setSelectedNuclide] = useState('All');
  const [selectedIndication, setSelectedIndication] = useState('All');

  const indications = useMemo(() => {
    const unique = new Set(RADIOPHARMACEUTICALS.map(t => t.indication));
    return ['All', ...Array.from(unique).sort()];
  }, []);

  const filteredTracers = useMemo(() => {
    return RADIOPHARMACEUTICALS.filter(tracer => {
      const matchesSearch = tracer.name.toLowerCase().includes(searchText.toLowerCase()) ||
                            tracer.indication.toLowerCase().includes(searchText.toLowerCase());
      const matchesNuclide = selectedNuclide === 'All' || tracer.nuclide === selectedNuclide;
      const matchesIndication = selectedIndication === 'All' || tracer.indication === selectedIndication;
      return matchesSearch && matchesNuclide && matchesIndication;
    });
  }, [searchText, selectedNuclide, selectedIndication]);

  const nuclides = ['All', ...getAllNuclides()];
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedNuclide('All');
    setSelectedIndication('All');
  };

  return (
    <div className="tab-content reference-tab">
      <h2>Tracer Reference</h2>
      <p className="section-description">All radiopharmaceuticals – doses in mCi, half‑lives included</p>
      <div className="search-box">
        <input type="text" placeholder="Search by name or indication..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      </div>
      <div className="filters-section">
        <div className="filter-group"><label>Radionuclide</label><select value={selectedNuclide} onChange={(e) => setSelectedNuclide(e.target.value)}>{nuclides.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
        <div className="filter-group"><label>Indication</label><select value={selectedIndication} onChange={(e) => setSelectedIndication(e.target.value)}>{indications.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
        {(searchText || selectedNuclide !== 'All' || selectedIndication !== 'All') && <button className="clear-filters-button" onClick={handleClearFilters}>Clear Filters</button>}
      </div>
      <div className="results-header">{filteredTracers.length} tracer(s) found</div>
      {filteredTracers.length > 0 ? (
        <div className="tracers-list">
          {filteredTracers.map(tracer => (
            <div key={tracer.id} className="tracer-card">
              <div className="tracer-header"><div className="tracer-info"><h3>{tracer.name}</h3><p className="tracer-nuclide">{tracer.nuclide}</p></div><span className="nuclide-badge">{tracer.nuclide}</span></div>
              <p className="tracer-indication">{tracer.indication}</p>
              <div className="tracer-details">
                <div className="detail-row"><span className="detail-label">Reference Dose:</span><span className="detail-value">{tracer.refMci.toFixed(1)} mCi @ {tracer.refWeightKg} kg</span></div>
                <div className="detail-row"><span className="detail-label">Range:</span><span className="detail-value">{tracer.minMci.toFixed(1)} – {tracer.maxMci.toFixed(1)} mCi</span></div>
                <div className="detail-row"><span className="detail-label">Half‑life:</span><span className="detail-value">{tracer.halfLifeHours.toFixed(2)} hours</span></div>
                <div className="detail-row"><span className="detail-label">Source:</span><span className="detail-value">{tracer.source}</span></div>
              </div>
              {tracer.notes && <p className="tracer-notes">{tracer.notes}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><p className="empty-title">No tracers found</p><p className="empty-description">Adjust search or filters</p></div>
      )}
    </div>
  );
}