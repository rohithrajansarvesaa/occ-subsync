# Frontend Dockerfile — Multi-stage build
# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Pass build-time API URL
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx (Alpine)
FROM nginx:1.25-alpine
# Remove default config
RUN rm /etc/nginx/conf.d/default.conf
# Copy production SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
