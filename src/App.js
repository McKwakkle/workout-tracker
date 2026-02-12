import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import WorkoutHistory from './pages/WorkoutHistory';
import Progress from './pages/Progress';
import Photos from './pages/Photos';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1 className="nav-logo">Workout Tracker</h1>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/log">Log Workout</NavLink>
            </li>
            <li>
              <NavLink to="/history">History</NavLink>
            </li>
            <li>
              <NavLink to="/progress">Progress</NavLink>
            </li>
            <li>
              <NavLink to="/photos">Photos</NavLink>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogWorkout />} />
            <Route path="/history" element={<WorkoutHistory />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/photos" element={<Photos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;