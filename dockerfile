# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install serve


# Copy the rest of the app
COPY . .

# Set the port environment variable
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Start the app using npm
CMD ["npm", "start"]
