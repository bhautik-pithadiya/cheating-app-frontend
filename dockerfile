# Use official Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the React app
RUN npm run build

# Install express if you're using server.js
RUN npm install express

# Copy SSL certificates from ssl folder in your project to the container root
COPY ssl/cert.pem ./cert.pem
COPY ssl/key.pem ./key.pem

# Expose HTTPS port
EXPOSE 5000

# Run HTTPS server
CMD ["node", "server.js"]
