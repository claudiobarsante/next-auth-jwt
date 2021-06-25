import { ReactNode } from 'react';
import { usePermissionsAndRoles } from '../hooks/usePermissionsAndRoles';
type Props = {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
};
export function CanSee({ children, permissions, roles }: Props) {
  const userCanSeeComponent = usePermissionsAndRoles({ permissions, roles });

  if (!userCanSeeComponent) return null;

  return <>{children}</>;
}
