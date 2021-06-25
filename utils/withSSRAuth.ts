import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import { AuthTokenError } from '../services/errors/AuthTokenError';

// -- A higher order function is a function that takes a function as an argument,
// -- or returns a function as its result
// -- 'P' is the type of the result to return
export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);

    if (!cookies['next-auth-jwt.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
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
