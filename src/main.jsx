import React, { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import logoUrl from '../assets/logo.svg';
const LogoScene = lazy(() => import('./LogoScene.jsx'));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function LogoExperience() {
  const section = useRef(null);
  const elapsed = useRef(0);
  const progress = useRef(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState(0);
  const [replay, setReplay] = useState(0);
  const [viewReset, setViewReset] = useState(0);
  const [interaction, setInteraction] = useState(0);
  const rotation = useRef({ x: 0, y: 0 });
  const drag = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => { setReduced(media.matches); if (media.matches) { elapsed.current = 8; setPlaying(false); setPhase(3); } };
    media.addEventListener('change', onChange);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new IntersectionObserver(([entry]) => { setVisible(entry.isIntersecting); }, { threshold: .2 });
    const loader = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); loader.disconnect(); } }, { rootMargin: '250px' });
    observer.observe(section.current); loader.observe(section.current);
    return () => { observer.disconnect(); loader.disconnect(); media.removeEventListener('change', onChange); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  useEffect(() => {
    if (!visible || !ready || started.current) return;
    started.current = true;
    if (reduced) { elapsed.current = 8; setPhase(3); } else setPlaying(true);
  }, [visible, ready, reduced]);
  function restart() { elapsed.current = 0; setPhase(0); setReplay(n => n + 1); setPlaying(true); }
  function pointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('is-dragging');
  }
  function pointerMove(event) {
    const last = drag.current;
    if (!last || last.id !== event.pointerId) return;
    rotation.current.y += (event.clientX - last.x) * .008;
    rotation.current.x = Math.max(-.9, Math.min(.9, rotation.current.x + (event.clientY - last.y) * .006));
    drag.current = { id: last.id, x: event.clientX, y: event.clientY };
    setInteraction(n => n + 1);
  }
  function pointerUp(event) { drag.current = null; event.currentTarget.classList.remove('is-dragging'); }
  function keyDown(event) {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)) return;
    event.preventDefault();
    setInteraction(n => n + 1);
    if (event.key === 'Home') { rotation.current = {x:0,y:0}; setViewReset(n=>n+1); return; }
    rotation.current.y += event.key === 'ArrowLeft' ? -.18 : event.key === 'ArrowRight' ? .18 : 0;
    rotation.current.x = Math.max(-.9, Math.min(.9, rotation.current.x + (event.key === 'ArrowUp' ? -.12 : event.key === 'ArrowDown' ? .12 : 0)));
  }
  const labels = ['Daisy / Blütenblätter', 'Rose / Organische Falten', 'Hydrangea / Florale Struktur', 'Sara / Die finale Form'];
  return <div className="logo-experience" ref={section}>
    <div className="logo-section-heading"><span className="section-index">01 / IN BLOOM</span><h2>Ein Logo.<br/><span>Viele Facetten.</span></h2><p>Von organischen Formen zu meiner eigenen Handschrift.</p></div>
    <div className="logo-stage-wrap">
      <div className="logo-stage" tabIndex={0} role="group" aria-label="3D-Logo drehen" aria-describedby="logo-instructions" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={pointerUp} onKeyDown={keyDown}>
        <div className={`logo-static ${ready && !failed ? 'is-hidden' : ''}`}><img src={logoUrl} alt="Blaues organisches Logo mit weißem S"/></div>
        {near && !failed && <SceneBoundary onFailure={() => setFailed(true)}><Suspense fallback={null}><LogoScene elapsed={elapsed} playing={playing} active={visible && pageVisible} reduced={reduced} replay={replay} rotation={rotation} viewReset={viewReset} interaction={interaction} onReady={() => setReady(true)} onPhase={setPhase} onFinish={() => setPlaying(false)} onProgress={value => { if (progress.current) progress.current.style.transform = `scaleX(${value})`; }} onFailure={()=>setFailed(true)}/></Suspense></SceneBoundary>}
      </div>
      <div className="logo-caption"><span aria-live="polite">{failed ? 'Die statische Form' : labels[phase]}</span><span>↔ DRAG TO EXPLORE</span></div>
      <div className="logo-progress" aria-hidden="true"><span ref={progress}/></div>
      <div className="logo-controls">
        <p id="logo-instructions">Ziehen zum Drehen · Pfeiltasten für die Ansicht</p>
        {!failed && <div><button disabled={!ready} onClick={phase === 3 ? restart : () => setPlaying(value => !value)}>{phase === 3 ? '↻ Noch einmal' : playing ? 'Ⅱ Pause' : '▷ Abspielen'}</button><button disabled={!ready} onClick={() => { rotation.current = { x:0, y:0 }; setViewReset(n=>n+1); }}>Ansicht zurücksetzen</button></div>}
      </div>
      {failed && <p className="logo-note">Die 3D-Ansicht ist in diesem Browser nicht verfügbar. Hier siehst du das originale Logo.</p>}
      {reduced && !failed && <p className="logo-note">Bewegung ist reduziert. Du kannst die Animation bewusst mit „Noch einmal“ starten.</p>}
    </div>
  </div>;
}
createRoot(document.getElementById('logo-experience')).render(<LogoExperience/>);
