import { Navigate } from 'react-router-dom'
import { hasAccess } from '../auth'

function ProtectedRoute({ children }) {
  if (!hasAccess()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
