# Dockerfile for the main application (including Taita agent)
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port for the Next.js application
EXPOSE 3000

# Start the Taita agent
CMD ["npm", "run", "agent"]
