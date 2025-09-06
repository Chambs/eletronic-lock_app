FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY back/user-services/ ./
EXPOSE 3001
CMD ["node","server.js"]
