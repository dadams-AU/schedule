# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the static HTML file to the Nginx web root directory
COPY index.html /usr/share/nginx/html/

# Expose port 80 for HTTP traffic
EXPOSE 80

# Command to run Nginx (already default in the base image, but good for clarity)
CMD ["nginx", "-g", "daemon off;"]
