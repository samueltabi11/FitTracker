import { Routes, Route } from 'react-router-dom'
import './App.css'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import LogStrengthForm from './components/LogStrengthForm'
import LogCardioForm from './components/LogCardioForm'

function App() {
  return (
    <div className="App">
      {/* nav stays up top no matter what route we're on */}
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log-strength" element={<LogStrengthForm />} />
        <Route path="/log-cardio" element={<LogCardioForm />} />
      </Routes>
    </div>
  )
}

export default App