# Use official Nginx image as base
FROM nginx:alpine

# Copy static files to Nginx web directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80
