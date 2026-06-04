FROM node:20 AS build
WORKDIR /app

ARG BUILD_CONFIGURATION=production

COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build -- --configuration=${BUILD_CONFIGURATION}

FROM nginx:alpine AS runtime
ARG NGINX_CONFIG=nginx.prod.conf
COPY nginx/${NGINX_CONFIG} /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/web-parser-client/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
