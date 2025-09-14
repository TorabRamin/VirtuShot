# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
# This is done first to leverage Docker's layer caching
COPY package.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Make port 5000 available to services outside this container
EXPOSE 5000

# Define the command to run the application
CMD ["node", "src/server.js"]