import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Museum from './pages/Museum';
import History from './pages/History';
import LiveRadio from './pages/LiveRadio';
import About from './pages/About';

const navItems = [
  { path: '/', label: 'INICIO', icon: '◈' },
  { path: '/museo', label: 'MUSEO 3D', icon: '▣' },
  { path: '/historia', label: 'HISTORIA', icon: '◷' },
  { path: '/en-vivo', label: 'EN VIVO', icon: '◉' },
  { path: '/acerca', label: 'ACERCA', icon: '◆' },
];

function Navigation() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--color-coal-black)]/95 backdrop-blur-sm border-b-2 border-[var(--color-rock-gray)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
              <motion.div
                className="w-10 h-10 bg-[var(--color-radio-red)] flex items-center justify-center font-display font-black text-white text-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                XII
              </motion.div>
              <div>
                <span className="text-[var(--color-phosphor-white)] font-display font-black text-lg tracking-tight uppercase block leading-none">
                  RADIO PÍO XII
                </span>
                <span className="font-mono text-[10px] text-[var(--color-ore-gray)] tracking-widest">
                  SIGLO XX — POTOSÍ
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors relative ${
                        isActive
                          ? 'text-[var(--color-phosphor-white)] border-[var(--color-radio-red)] bg-[var(--color-mine-dark)]'
                          : 'text-[var(--color-ore-gray)] border-transparent hover:text-[var(--color-phosphor-white)] hover:bg-[var(--color-mine-dark)]'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <span className="mr-1">{item.icon}</span>
                      {item.label}
                      {item.path === '/en-vivo' && (
                        <motion.span
                          className="ml-2 w-2 h-2 bg-[var(--color-mine-green)] inline-block"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Hamburger */}
            <motion.button
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 border border-[var(--color-rock-gray)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                className="w-5 h-0.5 bg-[var(--color-phosphor-white)]"
                animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="w-5 h-0.5 bg-[var(--color-phosphor-white)]"
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="w-5 h-0.5 bg-[var(--color-phosphor-white)]"
                animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 top-16 z-40 bg-[var(--color-coal-black)]/98 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <nav className="flex flex-col p-6 gap-2">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-6 py-4 font-mono text-lg uppercase tracking-wider border-l-4 transition-all ${
                      location.pathname === item.path
                        ? 'text-[var(--color-phosphor-white)] border-[var(--color-radio-red)] bg-[var(--color-mine-dark)]'
                        : 'text-[var(--color-ore-gray)] border-transparent hover:border-[var(--color-amber-dial)] hover:text-[var(--color-phosphor-white)]'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-grow flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-coal-black)] text-[var(--color-phosphor-white)]">
      <Navigation />

      <main className="flex-grow flex flex-col">
        <PageTransition>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/museo" element={<Museum />} />
            <Route path="/historia" element={<History />} />
            <Route path="/en-vivo" element={<LiveRadio />} />
            <Route path="/acerca" element={<About />} />
          </Routes>
        </PageTransition>
      </main>

      <footer className="border-t-2 border-[var(--color-rock-gray)] py-8 mt-auto bg-[var(--color-mine-dark)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-mono text-xs text-[var(--color-ore-gray)]">
              [ © 2026 RADIO PÍO XII — CENTRO MINERO SIGLO XX, POTOSÍ, BOLIVIA ]
            </p>
            <p className="font-mono text-xs text-[var(--color-ore-gray)]">
              &gt;&gt; MUSEO VIRTUAL INTERACTIVO 3D &lt;&lt;
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
