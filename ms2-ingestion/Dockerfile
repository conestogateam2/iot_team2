FROM redhat/ubi9-minimal:latest AS builder
ENV NODE_ENV=development
WORKDIR /app
RUN curl -fsSL https://rpm.nodesource.com/setup_20.x |  bash - && \
    microdnf install -y nodejs && \
    microdnf clean all
COPY ["package.json","tsconfig.json","./"]
RUN npm install && ls -l node_modules
COPY src/ src/
RUN npm run build && npm prune --production
FROM redhat/ubi9-micro:latest AS base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /usr/bin/node/ /usr/bin/node 
COPY --from=builder /usr/lib64/libstdc++.so.6 /usr/lib64/libstdc++.so.6
COPY --from=builder /app/bin/. /app/bin/
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY security/ security/
COPY csv/ csv/
COPY --from=builder /app /app
CMD ["node" , "/app/bin/index.js"]
