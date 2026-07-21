# apps/gateway/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
RUN npm install

COPY libs ./libs
COPY apps/gateway ./apps/gateway

RUN npx nest build gateway

FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/libs/proto ./libs/proto

CMD ["node", "dist/apps/gateway/main"]