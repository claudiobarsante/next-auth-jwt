import { useAuth } from '../contexts/AuthContext';
import { parseCookies } from 'nookies';
import { api } from './../services/api';
import { useEffect } from 'react';

const cookies = parseCookies();

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    api.get('/me').then(response => console.log(response));
  }, []);

  return <h1>Dashboard page !!!{user?.email}</h1>;
}
