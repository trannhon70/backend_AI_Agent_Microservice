# apps/chat-service/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
RUN npm install

COPY libs ./libs
COPY apps/chat-service ./apps/chat-service

RUN npx nest build chat-service

FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/libs/proto ./libs/proto

CMD ["node", "dist/apps/chat-service/main"]