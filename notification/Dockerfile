# Use the Node.js 18 base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --production

# Copy the source code to the working directory
COPY . .

# Expose port 3000 for the Todo App
EXPOSE 3001

# Use the Node.js 18 base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --production

# Copy the source code to the working directory
COPY . .

# Expose port 3001 for the Notification App
EXPOSE 3000

# Run the tests
RUN npm install --only=dev
RUN npm test


# Run the Notification App
CMD ["npm", "start"]
