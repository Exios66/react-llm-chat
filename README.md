import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';
import { debounce } from 'lodash';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress,
  Snackbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Message from './Message';
import useErrorHandler from '../../hooks/useErrorHandler';
import { logoutUser } from '../../redux/actions/authActions';

const useStyles = makeStyles((theme) => ({
  // ... (styles remain unchanged)
}));

const ENDPOINT = process.env.REACT_APP_API_URL;

let socket;

const Chat = () => {
  const classes = useStyles();
   ```
   REACT_APP_API_URL=your_backend_api_url
   ```

## Running the Application

1. Start the development server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To create a production build:

```
npm run build
```

This will create a `build` directory with the production-ready files.

## Testing

To run the tests:

```
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
