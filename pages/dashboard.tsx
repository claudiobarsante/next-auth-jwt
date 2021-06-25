import { useAuth } from '../contexts/AuthContext';
import { api } from './../services/apiClient';
import setupApiClient from './../services/api';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    api
      .get('/me')
      .then(response => console.log(response))
      .catch(error => console.log(error));
  }, []);

  return <h1>Dashboard page !!!{user?.email}</h1>;
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(
  async context => {
    const apiClient = setupApiClient(context); // -- on server-side you have to pass a context to access cookies
    const response = await apiClient.get('/me');
    console.log(response.data);
    return {
      props: {}
    };
  }
);
