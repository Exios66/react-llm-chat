#!/bin/bash

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Build the project with legacy OpenSSL provider and environment variables
REACT_APP_API_URL=https://your-backend-api-url.com npm run build:legacy

# Move to the build directory
cd build

# Create a .nojekyll file to bypass Jekyll processing
touch .nojekyll

# Initialize a new Git repository
git init

# Add all files to the new repository
git add .

# Commit the changes
git commit -m "Deploy to GitHub Pages"

# Add the remote repository
git remote add origin https://github.com/Exios66/react-llm-chat.git

# Push to the gh-pages branch
git push -f origin master:gh-pages

# Return to the project root
cd ..

echo "Deployment complete!"
