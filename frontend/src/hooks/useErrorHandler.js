import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';

const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleError = useCallback((error) => {
    console.error('An error occurred:', error);
    setError(error);
    enqueueSnackbar(error.message || 'An unexpected error occurred', { 
      variant: 'error',
      autoHideDuration: 5000,
    });
  }, [enqueueSnackbar]);

  return { error, handleError };
};

export default useErrorHandler;
