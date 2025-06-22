# Use an official Node.js image
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 8000

# Start the app
CMD ["node", "src/index.js"]
