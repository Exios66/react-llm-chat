import axios from 'axios';
import { SET_USER, CLEAR_USER } from './types';

export const registerUser = (userData) => async (dispatch) => {
  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, userData);
    dispatch({
      type: SET_USER,
      payload: res.data
    });
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (err) {
    console.error('Error registering user:', err.response.data);
    throw err;
  }
};

export const loginUser = (userData) => async (dispatch) => {
  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, userData);
    dispatch({
      type: SET_USER,
      payload: res.data
    });
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (err) {
    console.error('Error logging in:', err.response.data);
    throw err;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    dispatch({ type: CLEAR_USER });
    localStorage.removeItem('token');
  } catch (err) {
    console.error('Error logging out:', err.response.data);
    throw err;
  }
};

export const loadUser = () => async (dispatch) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    dispatch({
      type: SET_USER,
      payload: { user: res.data, token }
    });
  } catch (err) {
    console.error('Error loading user:', err.response.data);
    localStorage.removeItem('token');
    dispatch({ type: CLEAR_USER });
  }
};
