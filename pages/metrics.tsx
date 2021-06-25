import setupApiClient from './../services/api';
import React from 'react';
import { GetServerSideProps } from 'next';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(
  async context => {
    const apiClient = setupApiClient(context); // -- on server-side you have to pass a context to access cookies
    const response = await apiClient.get('/me');
    console.log(response.data);
    return {
      props: {}
    };
  },
  { permissions: ['metrics.lis'], roles: ['administrator'] }
);
