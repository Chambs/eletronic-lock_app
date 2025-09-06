FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY back/shared-bus/ ./
EXPOSE 3004
CMD ["node","eventBus.js"]
