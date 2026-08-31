# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config as a template. The nginx image's entrypoint runs envsubst
# over /etc/nginx/templates/*.template at startup, writing the rendered result
# to /etc/nginx/conf.d/default.conf. This is what makes BACKEND_HOST swappable
# (prod vs staging) without rebuilding the image.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
