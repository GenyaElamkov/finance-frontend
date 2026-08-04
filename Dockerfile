############################
# Build — сборка статики
############################
FROM node:22-alpine AS builder

WORKDIR /app

# Отдельный слой зависимостей — переустановка только при изменении package*.json
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL "зашивается" в бандл на этапе сборки (Vite инлайнит import.meta.env.*
# в build-time, .env файлы рантайма на него уже не повлияют).
#
# По умолчанию — относительный путь. Это работает, если nginx-прокси отдаёт
# frontend и backend с одного домена (frontend на "/", backend на "/api/"),
# что и реализовано в infra/nginx/conf.d/pocketkeeper.conf. Такой подход
# полностью убирает CORS и не требует знать домен на этапе сборки образа.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

############################
# Production — раздача статики через nginx
############################
FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:80/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
