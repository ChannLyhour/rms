import client from './axiosClient'

export const authApi = {
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
}
