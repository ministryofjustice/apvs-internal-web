// APVS0246
function isAuthenticated (req) {
  if (!req.user) {
    const error = new Error('unauthenticated')
    error.status = 401
    throw error
  }
}

function hasRoles (req, roles, throwError = true) {
  isAuthenticated(req)

  let hasDesiredRole = false
  roles.forEach(function (role) {
    if (req.user.roles.includes(role)) {
      hasDesiredRole = true
      return true
    }
  })
  if (throwError) {
    if (!hasDesiredRole) {
      const error = new Error('unauthorised')
      error.status = 403
      console.log('Error')
      throw error
    }
  } else {
    return hasDesiredRole
  }
}

module.exports.isAuthenticated = isAuthenticated
module.exports.hasRoles = hasRoles
