import { useAuth } from '../contexts/AuthContext';

type Params = {
  permissions?: string[];
  roles?: string[];
};

export function usePermissionsAndRoles({
  permissions = [],
  roles = []
}: Params) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  if (permissions.length > 0) {
    const hasAllPermissions = permissions.every(permissions => {
      return user.permissions.includes(permissions);
    });

    if (!hasAllPermissions) return false;
  }

  if (roles.length > 0) {
    const hasAllRoles = roles.some(roles => {
      return user.roles.includes(roles);
    });

    if (!hasAllRoles) return false;
  }

  return true;
}
