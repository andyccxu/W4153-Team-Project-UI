# First stage: Build the application
FROM node:16 as build

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the app's source code to the container
COPY . .

# Install dependencies
RUN npm install

# Build the Vite app for production
RUN npm run build

# Stage 2: Production environment
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Copy built files from Stage 1
COPY --from=build /app/dist ./dist

# Expose the port on which the app will run
EXPOSE 8080

# Command to serve the application using the "serve" package
CMD ["serve", "-s", "dist", "-l", "8080"]
