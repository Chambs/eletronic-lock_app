FROM ghcr.io/cirruslabs/flutter:3.35.3 AS build

WORKDIR /app
COPY flutter_app/pubspec.yaml ./
RUN flutter pub get
COPY flutter_app/ .
RUN flutter build web --release

FROM nginx:stable-alpine

COPY --from=build /app/build/web /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
