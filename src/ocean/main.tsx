import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { journey, frozenProgress } from './journey';

const OceanScene = lazy(() => import('./OceanScene'));
const HeroScene = lazy(() => import('./HeroScene'));
gsap.registerPlugin(ScrollTrigger);

/** A GPU or model failure must never take the portfolio content down with it. */
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function OceanExperience() {
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [failed, setFailed] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const onHeroReady = useCallback(() => setHeroReady(true), []);
  const heroRoot = document.getElementById('hero-model-root');
  const [ready, setReady] = useState(false);
  const enabled = !paused && !failed;
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);

  useEffect(() => {
    const hero = document.getElementById('home');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setHeroVisible(entry.isIntersecting),
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('hero-model-ready', enabled && heroReady);
    return () => document.body.classList.remove('hero-model-ready');
  }, [enabled, heroReady]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPaused(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('ocean-live', enabled && ready);
    document.body.classList.toggle('ocean-static', !enabled);
    return () => document.body.classList.remove('ocean-live', 'ocean-static');
  }, [enabled, ready]);

  useEffect(() => {
    if (!enabled) return;
    const update = () => {
      journey.progress =
        frozenProgress ??
        Math.min(
          1,
          Math.max(
            0,
            window.scrollY /
              Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight,
              ),
          ),
        );
    };
    if (frozenProgress !== null) {
      const seek = () =>
        window.scrollTo({
          top:
            (frozenProgress ?? 0) *
            (document.documentElement.scrollHeight - innerHeight),
          behavior: 'instant',
        });
      seek();
      document.fonts.ready.then(seek);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // Native document scrolling and normal anchors remain in control. Only the
    // visual layers are scrubbed; there is no wheel interception or scroll container.
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0.2, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 90%',
              end: 'top 48%',
              scrub: 0.65,
            },
          },
        );
      });
      gsap.utils
        .toArray<HTMLElement>('.dive-project-visual')
        .forEach((image, index) => {
          gsap.fromTo(
            image,
            { rotateY: index % 2 ? -6 : 6, y: 24 },
            {
              rotateY: 0,
              y: -12,
              ease: 'none',
              scrollTrigger: {
                trigger: image,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          );
        });
    });
    // Anchor jumps and keyboard focus should always expose the complete section.
    const onFocus = (event: FocusEvent) => {
      const section = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-reveal]',
      );
      if (section) gsap.set(section, { opacity: 1 });
    };
    document.addEventListener('focusin', onFocus);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('focusin', onFocus);
      context.revert();
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <SceneBoundary onError={onError}>
          <Suspense fallback={null}>
            <OceanScene
              onReady={onReady}
              onError={onError}
              active={!heroVisible}
            />
          </Suspense>
        </SceneBoundary>
      )}
      {enabled &&
        heroVisible &&
        heroRoot &&
        createPortal(
          <SceneBoundary onError={onError}>
            <Suspense fallback={null}>
              <HeroScene onReady={onHeroReady} onError={onError} />
            </Suspense>
          </SceneBoundary>,
          heroRoot,
        )}
      {createPortal(
        <div className="ocean-controls">
          <button
            type="button"
            className="ocean-toggle"
            aria-pressed={enabled}
            onClick={() => {
              setPaused(!paused);
              setReady(false);
              setHeroReady(false);
            }}
            disabled={failed}
          >
            <svg
              className="ocean-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d={enabled ? 'M8 5v14M16 5v14' : 'm8 5 11 7-11 7Z'} />
            </svg>
            {failed
              ? 'Statische Ansicht'
              : enabled
                ? 'Animation pausieren'
                : '3D aktivieren'}
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

const root = document.getElementById('ocean-root');
if (root) createRoot(root).render(<OceanExperience />);
