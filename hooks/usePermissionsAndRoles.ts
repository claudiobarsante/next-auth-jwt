import { useAuth } from '../contexts/AuthContext';
import { validateUserPermissionsAndRoles } from '../utils/validateUserPermissionsAndRoles';

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

  console.log('user dentro do validade ', user, isAuthenticated);

  const userHasValidPermissions = validateUserPermissionsAndRoles({
    permissions,
    roles,
    user
  });

  return userHasValidPermissions;
}
