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

# Install serve to serve the production build
RUN npm install -g serve
RUN npm install webrtc-adapter

# Expose the port serve uses
EXPOSE 5000

# Start the app
CMD ["serve", "-s", "build", "-l", "5000"]
