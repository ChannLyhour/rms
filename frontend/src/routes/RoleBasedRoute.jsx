import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * RoleBasedRoute — renders children if the user has one of the allowed roles OR permissions.
 * @param {string[]} roles — e.g. ['admin', 'cashier']
 * @param {string[]} permissions — e.g. ['orders.create', 'tables.manage']
 * @param {string} redirectTo — path to redirect if access not matched
 */
export default function RoleBasedRoute({ roles, permissions, redirectTo = '/unauthorized', children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Administrator always has full unrestricted access
  if (user.role?.name === 'admin') {
    return children
  }

  const roleMatched = roles && roles.includes(user.role?.name)

  const userPermSlugs = (user.role?.permissions || []).map((p) =>
    typeof p === 'string' ? p : p.slug
  )
  const permMatched = permissions && permissions.some((slug) => userPermSlugs.includes(slug))

  // If both roles and permissions are given, access is granted if EITHER matches
  if (roles && permissions) {
    if (roleMatched || permMatched) return children
    return <Navigate to={redirectTo} replace />
  }

  if (roles && !roleMatched) {
    return <Navigate to={redirectTo} replace />
  }

  if (permissions && !permMatched) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

