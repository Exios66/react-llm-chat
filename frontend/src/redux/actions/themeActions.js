export const setDarkMode = (isDarkMode) => ({
  type: 'SET_DARK_MODE',
  payload: isDarkMode,
});

export const toggleDarkMode = () => {
  return (dispatch, getState) => {
    const currentDarkMode = getState().theme.darkMode;
    dispatch(setDarkMode(!currentDarkMode));
  };
};
