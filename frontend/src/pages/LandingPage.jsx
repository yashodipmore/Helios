import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Modern Hero Visual - Clean Dashboard Preview
const HeroVisual = () => {
  const [activeMetric, setActiveMetric] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-visual-container">
      {/* Floating Dashboard Cards */}
      <motion.div 
        className="dashboard-preview"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Main Stats Card */}
        <div className="preview-card main-card">
          <div className="card-header">
            <span className="card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></span>
            <span className="card-title">Live Performance</span>
            <span className="status-live">● LIVE</span>
          </div>
          <div className="metrics-grid">
            <div className={`metric-item ${activeMetric === 0 ? 'active' : ''}`}>
              <span className="metric-value">98.2%</span>
              <span className="metric-label">Panel Health</span>
            </div>
            <div className={`metric-item ${activeMetric === 1 ? 'active' : ''}`}>
              <span className="metric-value">4.2 MW</span>
              <span className="metric-label">Power Output</span>
            </div>
            <div className={`metric-item ${activeMetric === 2 ? 'active' : ''}`}>
              <span className="metric-value">₹12.4L</span>
              <span className="metric-label">Daily Revenue</span>
            </div>
          </div>
          <div className="mini-chart">
            <svg viewBox="0 0 200 50" className="chart-line">
              <path 
                d="M0,40 L20,35 L40,38 L60,25 L80,28 L100,15 L120,18 L140,10 L160,12 L180,8 L200,5" 
                stroke="#111111" 
                strokeWidth="2" 
                fill="none"
              />
              <path 
                d="M0,40 L20,35 L40,38 L60,25 L80,28 L100,15 L120,18 L140,10 L160,12 L180,8 L200,5 L200,50 L0,50 Z" 
                fill="url(#chartGradient)"
              />
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#111111" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#111111" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Floating Alert Card */}
        <motion.div 
          className="preview-card alert-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="alert-header">
            <span className="alert-icon">🔍</span>
            <span>AI Detection</span>
          </div>
          <div className="alert-content">
            <div className="alert-item success">
              <span className="alert-dot"></span>
              <span>Panel A-12 Optimal</span>
            </div>
            <div className="alert-item warning">
              <span className="alert-dot"></span>
              <span>Panel B-07 Hotspot</span>
            </div>
            <div className="alert-item success">
              <span className="alert-dot"></span>
              <span>96% Efficiency</span>
            </div>
          </div>
        </motion.div>

        {/* Mini Panel Grid */}
        <motion.div 
          className="preview-card panel-grid-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="panel-mini-grid">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`mini-panel ${i === 4 ? 'warning' : i === 9 ? 'alert' : 'healthy'}`}
              />
            ))}
          </div>
          <span className="panel-count">247 Panels Monitored</span>
        </motion.div>
      </motion.div>

      {/* Background Gradient Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
    </div>
  );
};

// Feature Icons
const FeatureIcon1 = () => (
  <svg viewBox="0 0 64 64" fill="none" className="feature-icon">
    <circle cx="32" cy="32" r="28" stroke="#111111" strokeWidth="2" fill="#11111110" />
    <path d="M32 18V32L42 38" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="32" r="4" fill="#111111" />
  </svg>
);

const FeatureIcon2 = () => (
  <svg viewBox="0 0 64 64" fill="none" className="feature-icon">
    <rect x="12" y="20" width="40" height="28" rx="4" stroke="#111111" strokeWidth="2" fill="#11111110" />
    <path d="M20 32L28 38L44 24" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FeatureIcon3 = () => (
  <svg viewBox="0 0 64 64" fill="none" className="feature-icon">
    <circle cx="32" cy="20" r="10" stroke="#111111" strokeWidth="2" fill="#11111110" />
    <path d="M16 52C16 42 23 36 32 36C41 36 48 42 48 52" stroke="#111111" strokeWidth="2" fill="none" />
    <circle cx="20" cy="44" r="6" stroke="#111111" strokeWidth="2" fill="#11111110" />
    <circle cx="44" cy="44" r="6" stroke="#111111" strokeWidth="2" fill="#11111110" />
  </svg>
);

// Stats Counter Animation
const CountUp = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useState(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);
  
  return <span>{count}{suffix}</span>;
};

export default function LandingPage({ onEnterDashboard }) {

  // Fix body background for landing page
  useEffect(() => {
    document.body.style.background = '#F0F1F3';
    return () => { document.body.style.background = ''; };
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <svg viewBox="0 0 40 40" className="logo-icon">
              <circle cx="20" cy="20" r="18" fill="#111111" />
              <path d="M20 8L25 16H15L20 8Z" fill="white" />
              <circle cx="20" cy="24" r="8" fill="white" />
              <circle cx="20" cy="24" r="4" fill="#111111" />
            </svg>
            <span className="logo-text">HELIOS AI</span>
          </div>
          
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#technology">Technology</a>
            <a href="#stats">Impact</a>
            <a href="#team">Team</a>
          </div>
          
          <button className="nav-cta" onClick={onEnterDashboard}>
            Open Dashboard
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-overline">HELIOS AI PLATFORM</span>
          
          <h1 className="hero-title">
            The Future of
            <br />
            <span className="gradient-text">Solar Farm</span>
            <br />
            Management
          </h1>
          
          <p className="hero-subtitle">
            Predict faults before they happen. Reduce energy losses by up to 20%.
            Zero operational downtime. Powered by advanced AI.
          </p>
          
          <div className="hero-ctas">
            <button className="cta-primary" onClick={onEnterDashboard}>
              Launch Dashboard
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="cta-secondary">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Demo
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">96%</span>
              <span className="stat-label">Faster Detection</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">97%</span>
              <span className="stat-label">Cost Reduction</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Downtime</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <HeroVisual />
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section" id="features">
        <div className="section-container">
          <div className="problem-card">
            <div className="problem-content">
              <span className="section-tag">THE PROBLEM</span>
              <h2 className="section-title">
                India loses ₹47,000 Crores
                <br />
                annually to undetected
                <br />
                solar panel faults
              </h2>
              <p className="section-desc">
                Traditional EL imaging requires panel shutdown, complete darkness, 
                and expensive ₹5-10 lakh cameras. This means faults go undetected 
                for months, causing 15-20% energy losses across 70+ GW of installed capacity.
              </p>
              
              <div className="problem-stats">
                <div className="problem-stat">
                  <span className="problem-stat-value">70+</span>
                  <span className="problem-stat-label">GW Installed Capacity</span>
                </div>
                <div className="problem-stat">
                  <span className="problem-stat-value">15-20%</span>
                  <span className="problem-stat-label">Energy Lost to Faults</span>
                </div>
                <div className="problem-stat">
                  <span className="problem-stat-value">₹2000</span>
                  <span className="problem-stat-label">Per Panel Inspection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="innovation-section" id="technology">
        <div className="section-container">
          <span className="section-tag-center">THREE BREAKTHROUGH INNOVATIONS</span>
          <h2 className="section-title-center">
            World-First AI Technologies
          </h2>
          
          <div className="innovation-grid">
            <div className="innovation-card">
              <div className="innovation-number">01</div>
              <div className="innovation-icon">
                <svg viewBox="0 0 80 80" fill="none">
                  <rect x="10" y="15" width="60" height="50" rx="4" stroke="#111111" strokeWidth="2" />
                  <path d="M25 35L35 45L55 25" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="65" cy="20" r="12" fill="#111111" />
                  <path d="M65 15V25M60 20H70" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="innovation-title">Virtual EL Imaging</h3>
              <p className="innovation-desc">
                Generate Electroluminescence images from standard RGB photos using 
                conditional GANs. No shutdown, no darkness, no expensive cameras.
              </p>
              <ul className="innovation-benefits">
                <li>Works during daylight operation</li>
                <li>Eliminates ₹5-10 lakh camera cost</li>
                <li>96% faster than traditional methods</li>
              </ul>
            </div>
            
            <div className="innovation-card featured">
              <div className="innovation-number">02</div>
              <div className="innovation-icon">
                <svg viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="35" r="20" stroke="#111111" strokeWidth="2" fill="#11111115" />
                  <path d="M30 35C30 35 35 45 40 45C45 45 50 35 50 35" stroke="#111111" strokeWidth="2" />
                  <circle cx="35" cy="30" r="3" fill="#111111" />
                  <circle cx="45" cy="30" r="3" fill="#111111" />
                  <path d="M20 60H60" stroke="#111111" strokeWidth="2" />
                  <path d="M25 65H55" stroke="#111111" strokeWidth="2" />
                  <path d="M30 70H50" stroke="#111111" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="innovation-title">Explainable AI</h3>
              <p className="innovation-desc">
                Vision-Language Models provide natural language diagnostics 
                that operators can understand without specialized training.
              </p>
              <ul className="innovation-benefits">
                <li>Human-readable explanations</li>
                <li>70% reduction in training time</li>
                <li>Transparent decision-making</li>
              </ul>
            </div>
            
            <div className="innovation-card">
              <div className="innovation-number">03</div>
              <div className="innovation-icon">
                <svg viewBox="0 0 80 80" fill="none">
                  <circle cx="25" cy="25" r="12" stroke="#111111" strokeWidth="2" fill="#11111115" />
                  <circle cx="55" cy="25" r="12" stroke="#111111" strokeWidth="2" fill="#11111115" />
                  <circle cx="40" cy="55" r="12" stroke="#111111" strokeWidth="2" fill="#11111115" />
                  <path d="M33 32L35 45" stroke="#111111" strokeWidth="2" />
                  <path d="M47 32L45 45" stroke="#111111" strokeWidth="2" />
                  <path d="M37 25H43" stroke="#111111" strokeWidth="2" />
                  <circle cx="40" cy="40" r="6" fill="#111111" />
                </svg>
              </div>
              <h3 className="innovation-title">Multi-Modal Fusion</h3>
              <p className="innovation-desc">
                LLM synthesizes electrical, thermal, visual, and environmental 
                data for accurate root cause analysis.
              </p>
              <ul className="innovation-benefits">
                <li>Prevents wrong diagnosis</li>
                <li>97% cost reduction</li>
                <li>Actionable recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section">
        <div className="section-container">
          <div className="tech-card">
            <span className="section-tag">POWERED BY</span>
            <h2 className="tech-title">Enterprise-Grade Technology</h2>
            
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-logo groq">
                  <span className="tech-logo-text">GROQ</span>
                </div>
                <span className="tech-name">Groq Cloud</span>
                <span className="tech-desc">LLaMA 3.3 70B Versatile</span>
              </div>
              
              <div className="tech-item">
                <div className="tech-logo react">
                  <svg viewBox="-11.5 -10.232 23 20.463">
                    <circle r="2.05" fill="#61DAFB"/>
                    <g stroke="#61DAFB" fill="none" strokeWidth="1">
                      <ellipse rx="11" ry="4.2"/>
                      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
                    </g>
                  </svg>
                </div>
                <span className="tech-name">React 18</span>
                <span className="tech-desc">Modern UI Framework</span>
              </div>
              
              <div className="tech-item">
                <div className="tech-logo fastapi">
                  <svg viewBox="0 0 154 154" fill="none">
                    <circle cx="77" cy="77" r="77" fill="#009688"/>
                    <path d="M81.375 18.667l-38.75 70H77.5l-3.875 46.666 38.75-70H77.5l3.875-46.666z" fill="white"/>
                  </svg>
                </div>
                <span className="tech-name">FastAPI</span>
                <span className="tech-desc">High-Performance Backend</span>
              </div>
              
              <div className="tech-item">
                <div className="tech-logo firebase">
                  <svg viewBox="0 0 32 32">
                    <path d="M5.8 24.6l.17-.237 8.02-15.214.017-.03-.96-6.095a.79.79 0 00-1.49-.257l-5.77 21.833z" fill="#FFA000"/>
                    <path d="M5.9 24.42l.128-.31 7.994-13.282 1.234-4.136-3.144-5.936a.84.84 0 00-1.487-.063L5.9 24.42z" fill="#F57C00"/>
                    <path d="M16.584 14.01l2.632-2.652-2.632-5.178a.79.79 0 00-1.405 0l-1.326 2.498v.32l2.73 5.013z" fill="#FFCA28"/>
                    <path d="M5.96 24.512L6 24.5l.142-.24 8.28-13.51.024-1.5-1.166-2.218-7.32 17.48z" fill="#FFA000"/>
                    <path fill="#FFCA28" d="M16.58 6.29L26.1 24.42 22.7 27 16 22l-6.7 5-.6-2.58z"/>
                    <path d="M26.1 24.42L16.583 6.29a.79.79 0 00-1.405 0l-9.15 17.31a.88.88 0 00.48 1.28l15.45 5.05a.87.87 0 00.87-.18l3.27-5.33z" fill="#F57C00"/>
                    <path d="M25.97 24.39L16.56 6.18a.79.79 0 00-1.39 0L5.98 24.39a.86.86 0 00.46 1.24l9.2 3.83a.87.87 0 00.68 0l9.2-3.83a.86.86 0 00.45-1.24z" fill="#FFA000"/>
                    <path d="M16.75 29.47a.87.87 0 01-.68 0l-9.13-3.8-.07.17a.86.86 0 00.46 1.24l9.2 3.83a.87.87 0 00.68 0l9.2-3.83a.86.86 0 00.45-1.24l-.06-.17-9.05 3.8z" fill="#FFCA28"/>
                  </svg>
                </div>
                <span className="tech-name">Firebase</span>
                <span className="tech-desc">Realtime Database</span>
              </div>
              
              <div className="tech-item">
                <div className="tech-logo python">
                  <svg viewBox="0 0 32 32">
                    <defs>
                      <linearGradient id="pyBlue" x1="-.836" y1="-.637" x2=".864" y2=".627">
                        <stop offset="0" stopColor="#387EB8"/>
                        <stop offset="1" stopColor="#366994"/>
                      </linearGradient>
                      <linearGradient id="pyYellow" x1="-.611" y1="-.529" x2=".985" y2=".669">
                        <stop offset="0" stopColor="#FFE052"/>
                        <stop offset="1" stopColor="#FFC331"/>
                      </linearGradient>
                    </defs>
                    <path fill="url(#pyBlue)" d="M15.885 2.1c-7.1 0-6.651 3.07-6.651 3.07l.01 3.18h6.77v.95H6.3S2 8.8 2 16s3.77 6.9 3.77 6.9h2.24v-3.33s-.12-3.77 3.71-3.77h6.39s3.59.06 3.59-3.47V5.76s.54-3.66-5.82-3.66zm-3.66 2.12a1.18 1.18 0 110 2.36 1.18 1.18 0 010-2.36z"/>
                    <path fill="url(#pyYellow)" d="M16.115 29.9c7.1 0 6.651-3.07 6.651-3.07l-.01-3.18h-6.77v-.95H25.7S30 23.2 30 16s-3.77-6.9-3.77-6.9h-2.24v3.33s.12 3.77-3.71 3.77h-6.39s-3.59-.06-3.59 3.47v6.57s-.54 3.66 5.82 3.66zm3.66-2.12a1.18 1.18 0 110-2.36 1.18 1.18 0 010 2.36z"/>
                  </svg>
                </div>
                <span className="tech-name">Python</span>
                <span className="tech-desc">AI & Backend</span>
              </div>
              
              <div className="tech-item">
                <div className="tech-logo tailwind">
                  <svg viewBox="0 0 54 33">
                    <g clipPath="url(#prefix__clip0)">
                      <path fill="#38BDF8" fillRule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" clipRule="evenodd"/>
                    </g>
                  </svg>
                </div>
                <span className="tech-name">Tailwind CSS</span>
                <span className="tech-desc">Modern Styling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card">
            <h2 className="cta-title">
              Ready to revolutionize
              <br />
              your solar operations?
            </h2>
            <p className="cta-desc">
              Experience the power of AI-driven diagnostics. No hardware required.
            </p>
            <button className="cta-button" onClick={onEnterDashboard}>
              Launch Dashboard Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="team">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg viewBox="0 0 40 40" className="logo-icon">
                <circle cx="20" cy="20" r="18" fill="#111111" />
                <path d="M20 8L25 16H15L20 8Z" fill="white" />
                <circle cx="20" cy="24" r="8" fill="white" />
                <circle cx="20" cy="24" r="4" fill="#111111" />
              </svg>
              <span>HELIOS AI</span>
            </div>
            <p className="footer-tagline">
              Intelligent Solar Farm Diagnostic Platform
            </p>
          </div>
          
          <div className="footer-team">
            <h4>Our Team</h4>
            <div className="team-grid">
              <div className="team-member">
                <img src="/Yashodip.jpeg" alt="Yashodip More" className="team-photo" />
                <span className="team-name">Yashodip More</span>
              </div>
              <div className="team-member">
                <img src="/komal.jpeg" alt="Komal Kumavat" className="team-photo" />
                <span className="team-name">Komal Kumavat</span>
              </div>
              <div className="team-member">
                <img src="/jaykumar.jpeg" alt="Jaykumar Girase" className="team-photo" />
                <span className="team-name">Jaykumar Girase</span>
              </div>
              <div className="team-member">
                <img src="/tejas.jpeg" alt="Tejas Patil" className="team-photo" />
                <span className="team-name">Tejas Patil</span>
              </div>
            </div>
          </div>
          
          <div className="footer-institution">
            <h4>Institution</h4>
            <p>R.C. Patel Institute of Technology</p>
            <p>Shirpur, Maharashtra</p>
            <p className="footer-id">Project ID: TG0912740</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 HELIOS AI. Built for L&T Mission Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
