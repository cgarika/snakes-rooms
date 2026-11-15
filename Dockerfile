# GameNest room server: the production image (2026-11-15, GameNest 2.0 on needasix.com).
# BASE is GameNest's shared base image, built by the box kit (gamenest-box: docker/base.Dockerfile): Node 26.5.0, onnxruntime-node and the
# chat filter's model (Hugging Face, pinned revision, sha256-checked). Built on its own, this file uses plain Node 26.5.0 and the chat filter
# keeps only its word list.
ARG BASE=node:26.5.0-bookworm-slim@sha256:2d49d876e96237d76de412761cf05dbfe5aee325cc4406a4d41d5824c5bb8beb
FROM ${BASE}
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
