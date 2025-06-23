# Stage 1: Build the project
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install
COPY ./src ./src
COPY index.html ./
RUN npm run build

# Stage 2: Serve the static content
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]
