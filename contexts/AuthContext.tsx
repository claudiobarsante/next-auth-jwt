import Router from 'next/router';
import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';
import { setCookie } from 'nookies';

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

function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User>({} as User);
  const isAuthenticated = !!user;

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
