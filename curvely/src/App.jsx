import { useState, useCallback, useMemo } from 'react';
import Graph from './components/Graph.jsx';
import EquationList from './components/EquationList.jsx';
import { evaluate, parseSlider } from './utils/evaluate.js';
import { colorAt } from './utils/colors.js';
import { useWebMCP } from './lib/webmcp.js';

let nextId = 3;

function makeEq(id, expr = '') {
  const { fn, implicitFn, error } = evaluate(expr);
  return { id, expr, fn, implicitFn, error, color: colorAt(id - 1) };
}

const INITIAL = [
  makeEq(1, 'x^2'),
  makeEq(2, 'sin(x)'),
];

export default function App() {
  const [equations, setEquations] = useState(INITIAL);
  const [sliderValues, setSliderValues] = useState({});
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // `a = 3` rows drive a slider instead of plotting a curve. Value defaults from
  // the row's own number but a dragged value overrides it until the row is edited.
  const sliders = useMemo(() => equations
    .map((eq) => parseSlider(eq.expr))
    .filter(Boolean)
    .map((s) => ({ ...s, value: sliderValues[s.name] ?? s.value })), [equations, sliderValues]);

  const sliderScope = useMemo(() =>
    Object.fromEntries(sliders.map((s) => [s.name, s.value])), [sliders]);

  const curves = useMemo(() => equations.filter((eq) => !eq.hidden && !parseSlider(eq.expr)), [equations]);

  const handleSliderChange = useCallback((name, value) => {
    setSliderValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback((id, expr) => {
    setEquations((prev) =>
      prev.map((eq) => eq.id === id ? { ...eq, expr, ...evaluate(expr) } : eq)
    );
  }, []);

  const handleToggle = useCallback((id) => {
    setEquations((prev) => prev.map((eq) => eq.id === id ? { ...eq, hidden: !eq.hidden } : eq));
  }, []);

  const handleRemove = useCallback((id) => {
    setEquations((prev) => prev.filter((eq) => eq.id !== id));
  }, []);

  const handleAdd = useCallback((expr = '') => {
    const id = nextId++;
    setEquations((prev) => [...prev, makeEq(id, expr)]);
    return id;
  }, []);

  useWebMCP({
    equations,
    addEquation: handleAdd,
    changeEquation: handleChange,
    removeEquation: handleRemove,
  });

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font)',
      color: 'var(--text)',
      overflow: 'hidden',
    }}>
      <div className="main-layout">
        <div className="graph-pane">
          <Graph equations={curves} sliders={sliderScope} />
        </div>

        <div className={`sidebar-pane glass${panelCollapsed ? ' collapsed' : ''}`}>
          <button
            className="panel-handle"
            aria-label={panelCollapsed ? 'Show equations' : 'Hide equations'}
            aria-expanded={!panelCollapsed}
            onClick={() => setPanelCollapsed((c) => !c)}
          >{panelCollapsed ? '\u25B4' : '\u25BE'}</button>
          <EquationList
            equations={equations}
            sliders={sliders}
            onChange={handleChange}
            onRemove={handleRemove}
            onToggle={handleToggle}
            onAdd={() => handleAdd()}
            onSliderChange={handleSliderChange}
          />

          <div className="glass-card" style={{ marginTop: 12 }}>
            <div className="card-title">Quick examples</div>
            {['x^2', 'sin(x)', 'x^3-x', 'x^2+y^2=4', 'y > x^2', 'r = 1+cos(theta)', '(cos(t), sin(t))', '(1, 2)'].map((ex) => (
              <button key={ex} className="chip" onClick={() => handleAdd(ex)}>{ex}</button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
