# Use the official Node.js image as a base
FROM node:20-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy the rest of the source code to the working directory
COPY . .

# Install project dependencies
RUN rm package-lock.json
RUN npm install --force

# Compile the project using Vite
RUN npm run build

# Final stage for production
FROM nginx:alpine

# Copy the React project build from 'build' to the Nginx working directory
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to Nginx web server
EXPOSE 80

# Startup command for Nginx server
ENTRYPOINT ["nginx", "-g", "daemon off;"]