FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN rm -rf node_modules package-lock.json

RUN npm install @esbuild/linux-arm64

EXPOSE 3000 3001

CMD ["npm","run","dev:docker"]

