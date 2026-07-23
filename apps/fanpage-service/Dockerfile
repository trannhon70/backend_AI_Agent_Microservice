# apps/fanpage-service/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
RUN npm install

COPY libs ./libs
COPY apps/fanpage-service ./apps/fanpage-service

RUN npx nest build fanpage-service

FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/libs/proto ./libs/proto

CMD ["node", "dist/apps/fanpage-service/main"]