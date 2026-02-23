import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import Progress from './pages/Progress';
import Photos from './pages/Photos';
import WorkoutHistory from './pages/WorkoutHistory';
import Calendar from './pages/Calendar';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <Router basename="/workout-tracker">
      <div className="App">
        <nav className={`navbar ${navScrolled ? 'nav-scrolled' : ''}`}>
          <h1 className="nav-logo">Workout Tracker</h1>

          <button
            className="nav-burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? (
              <i className="fa-solid fa-xmark"></i>
            ) : (
              <i className="fa-solid fa-bars"></i>
            )}
          </button>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/" end onClick={() => setMenuOpen(false)}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/log" onClick={() => setMenuOpen(false)}>
                Log Workout
              </NavLink>
            </li>
            <li>
              <NavLink to="/progress" onClick={() => setMenuOpen(false)}>
                Progress
              </NavLink>
            </li>
            <li>
              <NavLink to="/photos" onClick={() => setMenuOpen(false)}>
                Photos
              </NavLink>
            </li>
            <li>
              <NavLink to="/history" onClick={() => setMenuOpen(false)}>
                History
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" onClick={() => setMenuOpen(false)}>
                Calendar
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="content-wrapper">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<LogWorkout />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/history" element={<WorkoutHistory />} />
              <Route path="/calendar" element={<Calendar />} />
            </Routes>
          </main>

          <footer className="site-footer">
            <div className="footer-links">
              <a
                href="https://github.com/McKwakkle"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                <i className="fa-brands fa-github"></i>
                Github
              </a>
              <a
                href="https://www.linkedin.com/in/kellan-mc-naughton-906653120/"
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                <i className="fa-brands fa-linkedin"></i>
                LinkedIn
              </a>
              <a href="#" className="footer-link footer-link-disabled">
                <i className="fa-solid fa-briefcase"></i>
                Portfolio (Coming Soon)
              </a>
            </div>
            <p className="footer-credit">
              Built by Kellan "Obelix" Mc Naughton
            </p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
