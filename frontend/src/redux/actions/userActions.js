export const setUser = (user) => ({
  type: 'SET_USER',
  payload: user,
});

export const clearUser = () => ({
  type: 'CLEAR_USER',
});

export const loginUser = (credentials) => {
  return async (dispatch) => {
    try {
      // Here you would typically make an API call to authenticate the user
      // For now, we'll just simulate a successful login
      const user = { name: credentials.username, id: Date.now() };
      dispatch(setUser(user));
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
};

export const logoutUser = () => {
  return async (dispatch) => {
    try {
      // Here you would typically make an API call to log out the user
      // For now, we'll just clear the user from the state
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };
};
