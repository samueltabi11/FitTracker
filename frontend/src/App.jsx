import { Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import LogStrengthForm from './components/LogStrengthForm'
import LogCardioForm from './components/LogCardioForm'
import GoalsPage from './components/GoalsPage'
import ProgressPage from './components/ProgressPage'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="App">
      {/* nav stays up top no matter what route we're on */}
      <Nav />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-strength"
          element={
            <ProtectedRoute>
              <LogStrengthForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-cardio"
          element={
            <ProtectedRoute>
              <LogCardioForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </div>
  )
}

export default App