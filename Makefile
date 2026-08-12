COMPOSE_PROD := docker compose -f docker-compose.yml
COMPOSE_DEV  := docker compose -f docker-compose.dev.yml

.PHONY: help \
	dev dev-build dev-up dev-down dev-restart dev-logs dev-shell \
	ps clean prune lint format

help: ## Показать список команд
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

## ---- Разработка (docker-compose.dev.yml) ----

dev: dev-build dev-up ## Собрать и запустить dev-окружение

dev-build: ## Собрать dev-образ
	$(COMPOSE_DEV) build

dev-up: ## Поднять dev-контейнер (с логами в терминале)
	$(COMPOSE_DEV) up

dev-down: ## Остановить и удалить dev-контейнер
	$(COMPOSE_DEV) down

dev-restart: dev-down dev-up ## Перезапустить dev-контейнер

dev-logs: ## Логи dev-контейнера
	$(COMPOSE_DEV) logs -f

dev-shell: ## Зайти в shell dev-контейнера
	$(COMPOSE_DEV) exec frontend sh

## ---- Общее ----

ps: ## Список запущенных контейнеров проекта
	docker ps --filter "name=finance-frontend"

clean: ## Остановить всё и удалить контейнеры/образы/volume проекта
	$(COMPOSE_DEV) down -v --rmi local --remove-orphans
	$(COMPOSE_PROD) down -v --rmi local --remove-orphans

prune: ## Полная очистка неиспользуемых Docker-ресурсов (осторожно, затронет весь Docker)
	docker system prune -f

lint: ## Запустить линтер локально (без Docker)
	npm run lint

format: ## Отформатировать код локально (без Docker)
	npm run format