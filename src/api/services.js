import axios from './axios';

/**
 *
 *Module Auth
 */

export const callRegister = (email, password, fullName) => {
  const data = {
    email: email,
    password: password,
    fullName: fullName
  }
  return axios.post('/auth/register', data)
}

export const callLogin = (email, password) => {
  const data = {
    email: email,
    password: password
  }
  return axios.post('/auth/login', data)
}

export const callFetchAccount = () => {
  console.log("Inside callFetchAccount function");
  return axios.get('/auth/account');
}

export const callRefreshToken = () => {
  return axios.get('/auth/refresh')
}

export const callLogout = () => {
  return axios.post('/auth/logout')
}

