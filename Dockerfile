# Use official Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all project files
COPY . .

# Expose port
EXPOSE 3000

# Environment variable for production
ENV NODE_ENV=production

# Start the app
CMD ["node", "main.js"]

