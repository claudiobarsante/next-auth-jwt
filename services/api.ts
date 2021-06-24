import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: {
  onSuccess: (newToken: string) => void;
  onFailure: (err: AxiosError<any>) => void;
}[] = []; // all requests that failed because of expired token

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['next-auth-jwt.token']}`
  }
});

api.interceptors.response.use(
  response => {
    return response;
  }, //-- if thre's no problem, just return the response
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        // renew token
        cookies = parseCookies();

        const { 'next-auth-jwt.refreshToken': refreshToken } = cookies;
        // -- all the request config did to the back-end, so here you have all the information
        // -- needed to repeat the request
        const originalConfig = error.config;

        // -- avoiding to call refresh multiple times until the first request is completed
        if (!isRefreshing) {
          isRefreshing = true;
          api
            .post('/refresh', { refreshToken })
            .then(response => {
              const { token: newToken, refreshToken: newRefreshToken } =
                response.data;

              setCookie(undefined, 'next-auth-jwt.token', newToken, {
                maxAge: 60 * 60 * 24 * 30, // keep the cookies max 30 days
                path: '/' //any route of my application could access these cookies
              });

              setCookie(
                undefined,
                'next-auth-jwt.refreshToken',
                newRefreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30, // keep the cookies max 30 days
                  path: '/'
                }
              );

              api.defaults.headers['Authorization'] = `Bearer ${newToken}`;

              // --getting all failed requests while refreshing process and trying again with new token
              failedRequestsQueue.forEach(request =>
                request.onSuccess(newToken)
              );
              failedRequestsQueue = [];
            })
            .catch(err => {
              failedRequestsQueue.forEach(request => request.onFailure(err));
              failedRequestsQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        // -- creating a queue with all failed requests because expired token
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (newToken: string) => {
              //retry  failed request with new token
              originalConfig.headers['Authorization'] = `Bearer ${newToken}`;

              resolve(api(originalConfig)); //call api again with new token
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            }
          });
        });
        //
      } else {
        // logout user
      }
    }
  }
);
