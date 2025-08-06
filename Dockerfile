FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache curl && \
    npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

