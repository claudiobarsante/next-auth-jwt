import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next';
import { parseCookies } from 'nookies';

// -- A higher order function is a function that takes a function as an argument,
// -- or returns a function as its result
// -- 'P' is the type of the result to return
export function WithSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);

    if (cookies['next-auth-jwt.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      };
    }

    /* -- if doesn't exist the cookie return the original function passed as a parameter wich is 
    async context => {
    return {
      props: {}
    };
  }*/
    return await fn(context);
  };
}
