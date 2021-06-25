type User = {
  permissions: string[];
  roles: string[];
};

type Params = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermissionsAndRoles({
  permissions = [],
  roles = [],
  user
}: Params) {
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
