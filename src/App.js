import { useState } from 'react';
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
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1 className="nav-logo">Workout Tracker</h1>

          <button
            className="nav-burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? '✕' : '☰'}
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
      </div>
    </Router>
  );
}

export default App;
