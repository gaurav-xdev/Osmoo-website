import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Command, Fingerprint, Orbit, ShieldCheck, Sparkles, Workflow, X } from 'lucide-react';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

function OrbScene() {
  return (
    <div className="orb-canvas spline-orb-frame" aria-label="Interactive Spline Reactive Orb" role="img">
      <iframe
        title="OSMOO Reactive Orb"
        src="https://app.spline.design/file/306ca2a5-d1ab-46ac-a27c-198575c82db0?view=preview"
        loading="eager"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
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
      gsap.to('.hero-orb-stage', {
        yPercent: 18, scale: 0.86, transformOrigin: '50% 45%', ease: 'none',
        scrollTrigger: { trigger: '.hero-scroll-space', start: 'top top', end: '72% top', scrub: 1.15 }
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
