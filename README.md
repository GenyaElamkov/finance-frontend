# PocketKeeper — Frontend

Веб-клиент для **PocketKeeper** — приложения для ведения семейного бюджета: счета, категории, транзакции и аналитика расходов/доходов.

Это фронтенд-часть проекта (Vue 3 + Vite). Backend — отдельный репозиторий на FastAPI + PostgreSQL, взаимодействие идёт через REST API.

## Возможности

- Регистрация и авторизация (JWT: access + refresh токены, восстановление пароля)
- Управление счетами (наличные, карты, вклады и т.д.)
- Категории доходов и расходов
- Учёт транзакций с быстрым добавлением дохода/расхода
- Аналитика: сводка по счетам, категориям и динамике за период (Future)
- Профиль пользователя

## Стек

- **Vue 3** (Composition API) + **Vite**
- **Pinia** — управление состоянием
- **Vue Router** — маршрутизация, защищённые роуты
- **Axios** — работа с API, интерцепторы для обновления токена
- **Tailwind CSS** — стилизация
- **Docker / Docker Compose** — сборка и запуск (dev и prod)
- **Nginx** — раздача статики в проде, SPA fallback, gzip, кеширование ассетов

## Архитектура

Фронтенд разворачивается отдельно от бэкенда и рассчитан на работу за общим reverse-proxy (nginx), который отдаёт фронт на `/` и проксирует `/api/` на backend — это убирает необходимость в CORS. Адрес API задаётся один раз на этапе сборки образа через `VITE_API_URL` (Vite инлайнит `import.meta.env.*` в бандл во время `build`, поэтому runtime `.env` на уже собранный образ не влияет).

## Быстрый старт

### Docker (dev, с hot-reload)

```bash
make dev          # сборка + запуск dev-контейнера
make dev-logs      # логи
make dev-shell     # зайти внутрь контейнера
make dev-down       # остановить
```

Полный список команд: `make help`.

### Прод-сборка

```bash
docker compose -f docker-compose.yml build --build-arg VITE_API_URL=https://example.com/api/v1
docker compose -f docker-compose.yml up -d
```

Контейнер собирает статику через multi-stage Dockerfile и отдаёт её через Nginx (порт `80`, наружу пробрасывается `8080`).

> `docker-compose.yml` из этого репозитория годится для локальной сборки/проверки прод-образа. Реальный деплой (frontend + backend + edge-nginx одним стеком) оркестрируется из отдельного репозитория [`finance-infra`](#связанные-репозитории).

## Переменные окружения

| Переменная      | Описание                                   | По умолчанию                      |
|-----------------|---------------------------------------------|------------------------------------|
| `VITE_API_URL`  | Базовый URL backend API                     | `http://127.0.0.1:8000/api/v1`     |

## Структура проекта

```
src/
├── assets/         # глобальные стили
├── components/     # переиспользуемые компоненты (в т.ч. ui/)
├── layouts/        # AuthLayout, MainLayout
├── views/          # страницы: auth, dashboard, accounts, categories,
│                   # transactions, analytics, profiles, errors
├── routers/        # конфигурация Vue Router
├── services/        # обёртки над Axios для запросов к API
└── stores/          # Pinia-хранилища (auth, accounts, categories,
                      # transactions, analytic)
```

## Скрипты

| Команда              | Что делает                          |
|-----------------------|---------------------------------------|
| `npm run dev`          | Запуск dev-сервера с hot-reload       |
| `npm run build`        | Прод-сборка в `dist/`                 |
| `npm run preview`      | Локальный просмотр прод-сборки        |
| `npm run lint`         | ESLint + oxlint с автофиксом          |
| `npm run format`       | Форматирование кода Prettier          |

## Связанные репозитории

- Backend (FastAPI + PostgreSQL) — *ссылка на репозиторий*
- [`finance-infra`](https://github.com/GenyaElamkov/finance-infra.git) — общий docker-compose для прод-деплоя (frontend + backend + edge nginx)

## Лицензия
 
Проект распространяется под лицензией **MIT** — подробности в файле [LICENSE](LICENSE).