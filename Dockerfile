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

# Define build arguments needed for Next.js build-time variables
ARG NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
ARG NEXT_PUBLIC_OPENWEATHERMAP_BASE_URL

# Expose them as environment variables during build
ENV NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=$NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
ENV NEXT_PUBLIC_OPENWEATHERMAP_BASE_URL=$NEXT_PUBLIC_OPENWEATHERMAP_BASE_URL

# Build the app
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]