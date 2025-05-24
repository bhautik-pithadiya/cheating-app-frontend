# Dockerfile

# Use official Node image to build the React app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the build folder with a lightweight HTTPS server
FROM node:18-alpine

WORKDIR /app

# Install serve package globally (to serve static build folder)
RUN npm install -g serve

# Copy build output from previous stage
COPY --from=build /app/build ./build

# Copy SSL certificates
COPY cert.pem ./cert.pem
COPY key.pem ./key.pem

# Expose port 5000
EXPOSE 5000

# Start the server with HTTPS
CMD ["serve", "-s", "build", "-l", "5000", "--ssl-cert", "cert.pem", "--ssl-key", "key.pem"]
