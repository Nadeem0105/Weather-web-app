# Use the official Node.js image as a base
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /Weather-web-app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm (fast and clean install from package-lock.json)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]