import { useState, useEffect } from 'react';
import { evaluate, parseSlider } from '../utils/evaluate.js';

export default function EquationRow({ eq, slider, onChange, onRemove, onSliderChange, showRemove }) {
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const { fn, error } = evaluate(eq.expr);
        setInvalid(fn === null && !!error);
      } catch {
        setInvalid(true);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [eq.expr]);

  const sliderDef = parseSlider(eq.expr);
  const sliderState = sliderDef && slider?.[sliderDef.name];

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: eq.color, flexShrink: 0,
                  }} />
        <input
          value={eq.expr}
          onChange={(e) => onChange(eq.id, e.target.value)}
          placeholder="y = x^2"
          spellCheck={false}
          inputMode="text"
          className={`eq-input${(eq.error || invalid) ? ' bad' : ''}`}
        />
        {showRemove && (
          <button
            className="rm-btn"
            aria-label="Remove equation"
            onClick={() => onRemove(eq.id)}
          >×</button>
        )}
      </div>
      {eq.error && (
        <div style={{
          marginTop: 4, marginLeft: 20,
          fontSize: 11, color: 'rgba(220,53,69,0.85)',
          fontFamily: 'var(--font)',
        }}>{eq.error}</div>
      )}
      {invalid && !eq.error && (
        <span style={{ fontSize: '0.7rem', color: '#e55', marginTop: 2, marginLeft: 20, display: 'block' }}>invalid expression</span>
      )}
      {sliderState != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, marginLeft: 20 }}>
          <input
            type="range"
            min={Math.min(-10, sliderState.value - 5)}
            max={Math.max(10, sliderState.value + 5)}
            step={0.1}
            value={sliderState.value}
            onChange={(e) => onSliderChange(sliderDef.name, Number(e.target.value))}
            style={{ flex: 1, accentColor: eq.color }}
          />
          <span style={{
            fontSize: 12, color: 'var(--text-secondary)', minWidth: 40, textAlign: 'right',
            fontFamily: 'var(--font)',
          }}>{sliderState.value.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}
