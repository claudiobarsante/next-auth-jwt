import Router from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { destroyCookie, setCookie, parseCookies } from 'nookies';

type Credentials = {
  email: string;
  password: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type AuthContextData = {
  signIn: (credentials: Credentials) => Promise<void>;
  user: User;
  isAuthenticated: boolean;
};

type Props = {
  children: React.ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, 'next-auth-jwt.token');
  destroyCookie(undefined, 'next-auth-jwt.refreshToken');
  Router.push('/');
}

function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User>({} as User);
  const isAuthenticated = !!user;

  useEffect(() => {
    // -- as the name of the cookie has a '.' dot, for destructuring it you have to place it inside quotes
    const { 'next-auth-jwt.token': token } = parseCookies();

    if (token) {
      // -- route to get user information
      api
        .get('/me')
        .then(response => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        .catch(() => {
          // -- if you have any error for this request destroy cookies an redirect user to login page
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: Credentials) {
    try {
      const response = await api.post('/sessions', { email, password });

      const { token, refreshToken, permissions, roles } = response.data;

      /** sessionStorage - only available when the window of the browser is open
       *  localStorage - only availabel on client-side,browser
       *  cookies - could be accessed both on client or server side
       */
      // -- first parameter undefined because it's ont the client side, 2nd name of the token, could be anything,3rd the token
      setCookie(undefined, 'next-auth-jwt.token', token, {
        maxAge: 60 * 60 * 24 * 30, // keep the cookies max 30 days
        path: '/' //any route of my application could access these cookies
      });
      setCookie(undefined, 'next-auth-jwt.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // keep the cookies max 30 days
        path: '/'
      });
      setUser({ email, permissions, roles });
      // -- setting headers Authorization after the first login, to avoid 401 errors if there isn't any cookies
      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
