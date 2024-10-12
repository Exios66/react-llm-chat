# Customization Guide

This document provides instructions on how to customize various aspects of the Chat Application.

## Theming

The application uses Material-UI for styling. You can customize the theme by modifying the `frontend/src/themes/theme.js` file.

### Changing Colors

To change the primary and secondary colors:

1. Open `frontend/src/themes/theme.js`
2. Modify the `lightTheme` and `darkTheme` objects:

```javascript
const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#your-primary-color',
    },
    secondary: {
      main: '#your-secondary-color',
    },
  },
});
```

## Adding New Features

### Creating a New Component

1. Create a new file in `frontend/src/components/`
2. Import necessary dependencies and create your component
3. Export your component and import it where needed

Example:

```javascript
// frontend/src/components/NewFeature.js
import React from 'react';

const NewFeature = () => {
  return <div>New Feature Content</div>;
};

export default NewFeature;
```

### Adding a New Route

1. Open `frontend/src/App.js`
2. Import your new component
3. Add a new Route in the Switch component:

```javascript
<Route path="/new-feature" component={NewFeature} />
```

## Backend Customization

### Adding a New API Endpoint

1. Create a new route file in `backend/routes/` if needed
2. Define your new endpoint:

```javascript
router.get('/new-endpoint', async (req, res) => {
  // Your logic here
  res.json({ message: 'New endpoint response' });
});
```

3. Import and use your new route in `backend/server.js`

### Modifying Database Schema

1. Open the relevant model file in `backend/models/`
2. Modify the schema as needed:

```javascript
const newSchema = new mongoose.Schema({
  // Your new schema fields
});
```

Remember to update any affected routes and controllers after modifying the schema.

## Environment Variables

To add new environment variables:

1. Add them to the `.env` file in the relevant directory (frontend or backend)
2. Use `process.env.YOUR_VARIABLE_NAME` to access them in the code
3. Update the `INSTALLATION.md` file to inform other developers about the new environment variables

Always ensure that sensitive information is kept in environment variables and not committed to the repository.
