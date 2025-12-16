# Build stage
FROM node:18-alpine AS build

ARG VITE_API_URL=/api
ARG VITE_GOOGLE_MAPS_API_KEY=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
