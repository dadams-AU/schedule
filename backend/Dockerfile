# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app/backend

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variables (can be overridden in docker-compose)
ENV NODE_ENV=development
ENV PORT=3001
# Add other DB-related ENV VARS if not sourced from .env directly by the app
# ENV DB_USERNAME=postgres
# ENV DB_PASSWORD=yourpassword
# ENV DB_NAME=calendar_dev
# ENV DB_HOST=db # This will be the service name in docker-compose

# Command to run the application
CMD [ "npm", "start" ]
