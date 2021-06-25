import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import { AuthTokenError } from '../services/errors/AuthTokenError';
import decode from 'jwt-decode';
import { validateUserPermissionsAndRoles } from './validateUserPermissionsAndRoles';

type Options = {
  permissions?: string[];
  roles?: string[];
};
// -- A higher order function is a function that takes a function as an argument,
// -- or returns a function as its result
// -- 'P' is the type of the result to return
export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: Options) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);
    const token = cookies['next-auth-jwt.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }

    if (options) {
      const user = decode<{ permissions: string[]; roles: string[] }>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissionsAndRoles({
        permissions,
        roles,
        user
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/nopermissions',
            permanent: false
          }
        };
      }
    }

    /* 1) if doesn't exist the cookie return the original function passed as a parameter
    2) if any error occur, redirect to login*/

    try {
      return await fn(context);
    } catch (err) {
      /* if (err instanceof AuthTokenError) {*/
      destroyCookie(context, 'next-auth-jwt.token');
      destroyCookie(context, 'next-auth-jwt.refreshToken');

      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }
  };
}
