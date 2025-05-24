# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Create SSL directory and copy certificates
RUN mkdir -p ssl
COPY ssl/cert.pem ssl/
COPY ssl/key.pem ssl/

# Ensure build and public directories exist and have proper permissions
RUN mkdir -p build public && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose the HTTPS port
EXPOSE 5000

# Start the app using our HTTPS server
CMD ["npm", "run","build"]
