FROM dart:stable AS builder
WORKDIR /app
COPY pubspec.* ./
RUN dart pub get
COPY . .
RUN dart compile exe bin/server.dart -o bin/server

FROM gcr.io/distroless/cc
WORKDIR /app
COPY --from=builder /app/bin/server .
EXPOSE 3002
CMD ["./server"]
