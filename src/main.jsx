import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Command, Fingerprint, Orbit, ShieldCheck, Sparkles, Workflow, X } from 'lucide-react';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

function OrbScene() {
  const mountRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scrollProgress = useRef(0);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const sphereGeometry = new THREE.SphereGeometry(1.62, 160, 160);
    // Procedural liquid-glass shader: no external image or video texture required.
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uReducedMotion: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vObjectPosition;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uReducedMotion;

        void main() {
          vec3 p = position;
          float motion = 1.0 - uReducedMotion;
          float waveA = sin(p.y * 4.2 + uTime * 0.48) * 0.022;
          float waveB = sin(p.x * 5.1 - p.z * 3.4 + uTime * 0.34) * 0.014;
          float waveC = sin((p.x + p.y + p.z) * 6.0 + uTime * 0.22) * 0.009;
          p += normal * (waveA + waveB + waveC) * motion;
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
          vObjectPosition = p;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        #include <tonemapping_pars_fragment>
        #include <colorspace_pars_fragment>
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vObjectPosition;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uReducedMotion;

        float hash(vec3 p) {
          p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
            f.z
          );
        }

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPosition);
          float time = uTime * (1.0 - uReducedMotion);
          vec3 p = normalize(vObjectPosition);
          float flow = noise(p * 5.2 + vec3(time * 0.12, -time * 0.17, time * 0.09));
          float ribbons = sin((p.x * 3.4 + p.y * 2.1 - p.z * 3.0 + flow * 1.8) * 3.0 + time * 0.26);
          float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.15);
          float edge = smoothstep(0.08, 0.94, fresnel);
          float liquid = smoothstep(-0.25, 0.92, ribbons * 0.42 + flow * 0.8);

          vec3 deepForest = vec3(0.025, 0.075, 0.046);
          vec3 greenGlass = vec3(0.10, 0.25, 0.14);
          vec3 mintGlass = vec3(0.43, 0.67, 0.47);
          vec3 pearl = vec3(0.88, 0.91, 0.78);
          vec3 spectral = vec3(
            0.48 + 0.36 * sin(fresnel * 7.0 + 0.2),
            0.58 + 0.30 * sin(fresnel * 7.0 + 2.2),
            0.48 + 0.38 * sin(fresnel * 7.0 + 4.1)
          );

          vec3 color = mix(deepForest, greenGlass, smoothstep(0.08, 0.9, liquid));
          color = mix(color, mintGlass, smoothstep(0.48, 0.92, flow) * 0.42);
          color = mix(color, spectral, edge * 0.68);
          color = mix(color, pearl, smoothstep(0.77, 0.99, edge) * 0.74);

          vec3 keyLight = normalize(vec3(-0.52, 0.72, 0.66));
          vec3 fillLight = normalize(vec3(0.68, -0.2, 0.55));
          float specular = pow(max(dot(reflect(-keyLight, N), V), 0.0), 52.0);
          float broadHighlight = pow(max(dot(N, keyLight), 0.0), 5.0);
          float fillHighlight = pow(max(dot(N, fillLight), 0.0), 10.0);
          float streak = smoothstep(0.76, 0.99, sin((p.x * 1.2 + p.y * 0.8 + p.z * 0.6) * 8.0 + flow * 3.0 + time * 0.18));
          color += pearl * specular * 1.2;
          color += mintGlass * broadHighlight * 0.26;
          color += vec3(0.36, 0.62, 0.40) * fillHighlight * 0.5;
          color += pearl * streak * edge * 0.18;
          color *= 0.94 + 0.06 * sin(p.y * 3.0 + time * 0.2);

          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    root.add(sphere);

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(1.635, 96, 96),
      new THREE.MeshBasicMaterial({ color: '#81916c', side: THREE.BackSide, transparent: true, opacity: 0.13 })
    );
    root.add(shell);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#a8b67d', transparent: true, opacity: 0.42 });
    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(2.02, 0.006, 8, 240), ringMaterial);
    ringOne.rotation.set(1.02, 0.22, -0.38);
    root.add(ringOne);
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.004, 8, 240), new THREE.MeshBasicMaterial({ color: '#4c6044', transparent: true, opacity: 0.55 }));
    ringTwo.rotation.set(0.3, 1.18, 0.72);
    root.add(ringTwo);

    const specks = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 440; i++) {
      const radius = 2.1 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi));
    }
    specks.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const stars = new THREE.Points(specks, new THREE.PointsMaterial({ color: '#77866a', size: 0.012, transparent: true, opacity: 0.56, sizeAttenuation: true }));
    root.add(stars);

    scene.add(new THREE.AmbientLight('#e7e8d5', 1.15));
    const key = new THREE.DirectionalLight('#fff0d5', 4.2);
    key.position.set(-4, 5, 5);
    scene.add(key);
    const fill = new THREE.PointLight('#b9d18c', 2.6, 18);
    fill.position.set(4, -1, 3);
    scene.add(fill);
    const rim = new THREE.PointLight('#a8b99a', 3.4, 16);
    rim.position.set(-3, -3, -3);
    scene.add(rim);

    let frame;
    const clock = new THREE.Clock();
    const resize = () => {
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.position.z = width < 700 ? 9.2 : 7.5;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.35 : 1.7));
    };
    const onPointer = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const section = document.querySelector('.hero-scroll-space');
      if (!section) return;
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      scrollProgress.current = THREE.MathUtils.clamp(-section.getBoundingClientRect().top / distance, 0, 1);
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    onScroll();

    const render = () => {
      frame = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sphereMaterial.uniforms.uTime.value = t;
      sphereMaterial.uniforms.uPointer.value.set(pointer.current.x, pointer.current.y);
      sphereMaterial.uniforms.uReducedMotion.value = reduced ? 1 : 0;
      const progress = scrollProgress.current;
      root.rotation.y += ((pointer.current.x * 0.12 + t * (reduced ? 0.015 : 0.055)) - root.rotation.y) * 0.025;
      root.rotation.x += ((-pointer.current.y * 0.07 + Math.sin(t * 0.25) * 0.035) - root.rotation.x) * 0.025;
      sphere.rotation.y = t * 0.045;
      ringOne.rotation.z = -0.38 + t * 0.035;
      ringTwo.rotation.x = 0.3 + Math.sin(t * 0.18) * 0.07;
      stars.rotation.y = -t * 0.012;
      root.position.y = Math.sin(t * 0.55) * 0.045 - progress * 0.72;
      const scale = 1 - progress * 0.39;
      root.scale.setScalar(scale);
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      shell.geometry.dispose();
      shell.material.dispose();
      ringOne.geometry.dispose();
      ringOne.material.dispose();
      ringTwo.geometry.dispose();
      ringTwo.material.dispose();
      stars.material.dispose();
      ringMaterial.dispose();
      specks.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="orb-canvas" ref={mountRef} aria-label="Animated three-dimensional forest-green metallic orb" role="img" />;
}

function Navigation() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.58);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <nav className={`nav-shell ${visible ? 'nav-visible' : ''}`} aria-label="Main navigation">
      <a className="nav-brand" href="#top" aria-label="OSMOO home"><span className="brand-mark"><span /></span>OSMOO</a>
      <div className="nav-links">
        <a href="#approach">Approach</a><a href="#capabilities">Capabilities</a><a href="#experience">Experience</a>
      </div>
      <a className="nav-cta" href="#early-access">Get OSMOO <ArrowUpRight size={15} /></a>
      <button className="mobile-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20}/> : <span className="menu-lines"><i/><i/></span>}</button>
      {menuOpen && <div className="mobile-menu"><a onClick={() => setMenuOpen(false)} href="#approach">Approach</a><a onClick={() => setMenuOpen(false)} href="#capabilities">Capabilities</a><a onClick={() => setMenuOpen(false)} href="#experience">Experience</a><a onClick={() => setMenuOpen(false)} href="#early-access">Get OSMOO ↗</a></div>}
    </nav>
  );
}

function SectionLabel({ number, children }) {
  return <div className="section-label"><span>{number}</span><span className="label-rule" /><span>{children}</span></div>;
}

function ProductPreview() {
  const [active, setActive] = useState('workspace');
  return (
    <div className="product-window">
      <div className="window-topbar">
        <div className="window-dots"><i/><i/><i/></div>
        <span className="window-title">OSMOO / COMPANION</span>
        <span className="window-status"><span/> CONCEPT PREVIEW</span>
      </div>
      <div className="window-body">
        <aside className="window-sidebar">
          <div className="mini-brand"><span className="brand-mark"><span/></span>OSMOO</div>
          <button className={active === 'workspace' ? 'active' : ''} onClick={() => setActive('workspace')}><Command size={15}/> Workspace</button>
          <button className={active === 'voice' ? 'active' : ''} onClick={() => setActive('voice')}><AudioLines size={15}/> Voice</button>
          <button className={active === 'memory' ? 'active' : ''} onClick={() => setActive('memory')}><Orbit size={15}/> Context</button>
          <div className="sidebar-bottom"><span className="status-pulse"/> Companion ready</div>
        </aside>
        <div className="window-content">
          <div className="preview-greeting"><span className="eyebrow">YOUR OPERATING COMPANION</span><h3>{active === 'workspace' ? 'Make room for the work.' : active === 'voice' ? 'A more natural interface.' : 'Context that stays with you.'}</h3><p>{active === 'workspace' ? 'A considered space for working with your computer.' : active === 'voice' ? 'Designed around conversation, not command syntax.' : 'A place for preferences, continuity and control.'}</p></div>
          <div className="preview-cards">
            <div className="preview-card preview-card-dark"><span className="preview-card-icon"><Sparkles size={16}/></span><span className="preview-card-label">COMPANION</span><strong>{active === 'voice' ? 'Speak naturally' : active === 'memory' ? 'Keep the context' : 'Your next move'}</strong><span className="card-foot">Designed around your workflow <ArrowUpRight size={13}/></span></div>
            <div className="preview-card"><span className="preview-card-icon"><Workflow size={16}/></span><span className="preview-card-label">WORKFLOW</span><strong>{active === 'workspace' ? 'Intent → action' : active === 'voice' ? 'Listen → respond' : 'Remember → adapt'}</strong><div className="preview-progress"><span/></div><span className="card-foot">A clear path from thought to task</span></div>
          </div>
          <div className="preview-input"><span>Tell OSMOO what you want to work on…</span><div><AudioLines size={16}/><ArrowUpRight size={16}/></div></div>
          <p className="preview-disclaimer">Illustrative interface concept · Not a live application</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const pageRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-kicker, .hero-title .letter, .hero-subtitle, .hero-bottom', {
        y: 28, opacity: 0, duration: 1.05, stagger: 0.07, ease: 'power3.out', delay: 0.18
      });
      gsap.to('.hero-title', {
        yPercent: -22, scale: 0.8, transformOrigin: '50% 50%', ease: 'none',
        scrollTrigger: { trigger: '.hero-scroll-space', start: 'top top', end: '62% top', scrub: 0.8 }
      });
      gsap.to('.hero-copy', {
        yPercent: -35, opacity: 0.18, ease: 'none',
        scrollTrigger: { trigger: '.hero-scroll-space', start: 'top top', end: '55% top', scrub: 0.7 }
      });
      gsap.to('.hero-orbit-caption', {
        opacity: 0, y: -18, ease: 'none',
        scrollTrigger: { trigger: '.hero-scroll-space', start: 'top top', end: '24% top', scrub: true }
      });
      gsap.utils.toArray('.reveal').forEach((element) => {
        gsap.fromTo(element, { y: 42, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 86%', once: true }
        });
      });
      gsap.utils.toArray('.feature-row').forEach((element, index) => {
        gsap.fromTo(element, { x: index % 2 ? 24 : -24, opacity: 0.35 }, {
          x: 0, opacity: 1, duration: 0.85, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        });
      });
      gsap.fromTo('.product-window', { y: 70, rotateX: 5, opacity: 0 }, {
        y: 0, rotateX: 0, opacity: 1, duration: 1.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.product-window', start: 'top 82%', once: true }
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="site-shell" ref={pageRef} id="top">
      <Navigation />
      <main>
        <section className="hero-scroll-space">
          <div className="hero-sticky">
            <div className="hero-grid" aria-hidden="true" />
            <div className="hero-orb-stage"><OrbScene /></div>
            <div className="hero-orbit-caption"><span className="caption-dot"/><span>AN OPERATING COMPANION</span><span className="caption-line"/><span>BUILT AROUND YOU</span></div>
            <div className="hero-copy">
              <p className="hero-kicker"><span className="tiny-star">✳</span> A NEW WAY TO WORK WITH YOUR COMPUTER</p>
              <h1 className="hero-title" aria-label="OSMOO"><span className="letter">O</span><span className="letter">S</span><span className="letter">M</span><span className="letter">O</span><span className="letter">O</span><span className="title-period">.</span></h1>
              <p className="hero-subtitle">Less operating your computer.<br/><em>More getting things done.</em></p>
            </div>
            <div className="hero-bottom"><span>01 / A MORE NATURAL INTERFACE</span><a href="#approach">SCROLL TO EXPLORE <ArrowDownRight size={15}/></a><span>MADE FOR YOUR FLOW</span></div>
          </div>
        </section>

        <section className="intro-section section-pad" id="approach">
          <div className="intro-layout">
            <SectionLabel number="01">THE IDEA</SectionLabel>
            <div className="intro-main reveal"><p className="display-heading">Your computer is a tool.<br/><span>Working with it should feel natural.</span></p><div className="intro-bottom"><p>OSMOO is being built as an operating companion that brings a more human way to interact with your computer into one considered experience.</p><a className="text-link" href="#capabilities">MEET THE APPROACH <ArrowUpRight size={16}/></a></div></div>
          </div>
          <div className="intro-index"><span>OSMOO / 001</span><span>INTENT OVER INTERFACE</span><span>EST. IN POSSIBILITY</span></div>
        </section>

        <section className="capabilities-section section-pad" id="capabilities">
          <div className="section-heading reveal"><SectionLabel number="02">THE APPROACH</SectionLabel><h2>Less friction.<br/><em>More flow.</em></h2><p>Technology should adapt to the way you think, speak and work. Not the other way around.</p></div>
          <div className="feature-list">
            <article className="feature-row"><div className="feature-number">01</div><div className="feature-icon"><AudioLines size={22}/></div><div className="feature-copy"><h3>Speak like you mean it.</h3><p>A voice-first direction for getting things done without turning every intention into a series of clicks.</p></div><div className="feature-aside"><span>VOICE / INTERACTION</span><ArrowUpRight size={18}/></div></article>
            <article className="feature-row"><div className="feature-number">02</div><div className="feature-icon"><Workflow size={22}/></div><div className="feature-copy"><h3>From intention to action.</h3><p>A workflow built around understanding the task, planning a path and keeping the person in control.</p></div><div className="feature-aside"><span>PLANNING / EXECUTION</span><ArrowUpRight size={18}/></div></article>
            <article className="feature-row"><div className="feature-number">03</div><div className="feature-icon"><ShieldCheck size={22}/></div><div className="feature-copy"><h3>Your system. Your say.</h3><p>Control and transparency belong in the experience from the start, not buried in the fine print.</p></div><div className="feature-aside"><span>CONTROL / TRUST</span><ArrowUpRight size={18}/></div></article>
          </div>
        </section>

        <section className="orb-interlude">
          <div className="interlude-orb-mark"><div className="interlude-ring ring-a"/><div className="interlude-ring ring-b"/><div className="interlude-core"/></div>
          <div className="interlude-copy reveal"><span className="eyebrow">A BETTER RELATIONSHIP WITH YOUR MACHINE</span><p>Not another tab.<br/><em>A different way in.</em></p><span className="interlude-foot">THOUGHTFUL BY DESIGN / BUILT TO EVOLVE</span></div>
        </section>

        <section className="experience-section section-pad" id="experience">
          <div className="experience-heading reveal"><SectionLabel number="03">THE EXPERIENCE</SectionLabel><div><h2>A calmer centre<br/>for <em>your workflow.</em></h2><p>A glimpse of the design direction: deliberate, quiet and focused on the work in front of you.</p></div></div>
          <ProductPreview />
          <div className="preview-note"><span>INTERFACE STUDY / 001</span><span>VISUAL CONCEPT · NOT A LIVE PRODUCT SCREEN</span></div>
        </section>

        <section className="principles-section section-pad">
          <SectionLabel number="04">THE PRINCIPLES</SectionLabel>
          <div className="principles-grid">
            <div className="principle-card reveal"><span className="principle-index">A / 01</span><Fingerprint size={23}/><h3>Personal by nature.</h3><p>An experience that should feel like it belongs to the person using it.</p></div>
            <div className="principle-card reveal"><span className="principle-index">A / 02</span><Orbit size={23}/><h3>Calm, not crowded.</h3><p>Less interface noise. More attention left for what actually matters.</p></div>
            <div className="principle-card reveal"><span className="principle-index">A / 03</span><ShieldCheck size={23}/><h3>Control stays human.</h3><p>Useful automation should be understandable, deliberate and accountable.</p></div>
          </div>
        </section>

        <section className="closing-section" id="early-access">
          <div className="closing-orb-glow" aria-hidden="true"/>
          <div className="closing-content reveal"><span className="eyebrow"><span className="caption-dot"/> THE NEXT WAY TO WORK</span><h2>Your flow.<br/><em>Your machine.</em><br/>OSMOO.</h2><p>We're building a more natural way to work with your computer.</p><a className="closing-cta" href="https://github.com/gaurav-xdev/Osmoo-website" target="_blank" rel="noreferrer">Follow the build <ArrowUpRight size={17}/></a><span className="closing-note">EARLY ACCESS DETAILS TO FOLLOW</span></div>
          <div className="closing-bottom"><span>OSMOO / OPERATING COMPANION</span><span>BUILT WITH INTENTION.</span></div>
        </section>
      </main>
      <footer className="site-footer"><a className="footer-brand" href="#top"><span className="brand-mark"><span/></span>OSMOO</a><span>BY OSMIORA COMPUTATIONAL SYSTEMS</span><a href="#top">BACK TO TOP ↑</a><span>© 2026 OSMOO</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
