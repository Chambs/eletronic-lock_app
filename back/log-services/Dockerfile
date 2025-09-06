FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY back/log-services/ ./
EXPOSE 3002
CMD ["node","server.js"]
