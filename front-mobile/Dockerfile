# Dockerfile para Front Mobile - Electronic Lock App
FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3004

CMD ["npm", "start"]
