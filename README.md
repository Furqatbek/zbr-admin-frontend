# ZBR Delivery Admin Panel

Административная панель для управления платформой доставки еды ZBR Delivery.

## Технологический стек

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4 with CSS Variables
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router 7 with lazy loading
- **Charts**: Recharts
- **Real-time**: WebSocket (STOMP)
- **Testing**: Vitest + React Testing Library
- **Containerization**: Docker + nginx

## Структура проекта

```
src/
├── api/              # API клиенты и axios конфигурация
├── components/
│   ├── layout/       # Layout компоненты (Sidebar, Header)
│   ├── shared/       # Переиспользуемые компоненты (ErrorBoundary)
│   └── ui/           # UI компоненты (Button, Input, Badge, etc.)
├── hooks/            # React Query хуки для API
├── lib/              # Утилиты (cn, formatters)
├── pages/            # Страницы приложения
│   ├── analytics/    # Аналитика
│   ├── auth/         # Авторизация
│   ├── couriers/     # Управление курьерами
│   ├── dashboard/    # Дашборд
│   ├── notifications/# Уведомления
│   ├── orders/       # Управление заказами
│   ├── restaurants/  # Управление ресторанами
│   ├── settings/     # Настройки
│   └── users/        # Управление пользователями
├── store/            # Zustand stores (auth, theme)
├── test/             # Тестовые утилиты
├── types/            # TypeScript типы
├── websocket/        # WebSocket клиент
├── router.tsx        # Конфигурация маршрутов
├── main.tsx          # Точка входа
└── index.css         # Глобальные стили и CSS переменные
```

## Быстрый старт

### Требования

- Node.js 20+
- npm или yarn

### Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd zbr-admin-frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Приложение будет доступно по адресу http://localhost:3000

### Переменные окружения

Создайте `.env` файл в корне проекта:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev сервера |
| `npm run build` | Production сборка |
| `npm run preview` | Просмотр production сборки |
| `npm run lint` | Запуск ESLint |
| `npm run test` | Запуск тестов в watch режиме |
| `npm run test:run` | Однократный запуск тестов |
| `npm run test:coverage` | Запуск тестов с coverage |
| `npm run test:ui` | Vitest UI интерфейс |

## Docker

### Сборка образа

```bash
docker build -t zbr-admin-frontend .
```

### Запуск контейнера

```bash
docker run -p 80:80 zbr-admin-frontend
```

### Docker Compose

```bash
docker-compose up -d
```

## Функциональность

### Модули

1. **Dashboard** - Главный дашборд с ключевыми метриками
2. **Users** - Управление пользователями (CRUD, роли, блокировка)
3. **Orders** - Управление заказами (статусы, детали, проблемные)
4. **Couriers** - Управление курьерами (статусы, карта, назначения)
5. **Restaurants** - Управление ресторанами (CRUD, меню, модерация)
6. **Analytics** - Аналитические дашборды:
   - Доходы
   - Заказы
   - Операции
   - Финансы
   - Customer Experience
   - Fraud Detection
   - Технические метрики
7. **Notifications** - Рассылка уведомлений, очистка
8. **Settings** - Настройки платформы, экспорт данных

### Особенности

- **Темная тема** - Поддержка светлой/темной/системной темы
- **Real-time обновления** - WebSocket для живых данных
- **Lazy Loading** - Код-сплиттинг для оптимальной загрузки
- **Responsive Design** - Адаптивный дизайн
- **Интернационализация** - Интерфейс на русском языке
- **Error Boundaries** - Обработка ошибок на уровне компонентов
- **Toast уведомления** - Система уведомлений

## Тестирование

Проект использует Vitest и React Testing Library.

```bash
# Запуск тестов
npm run test

# Coverage отчёт
npm run test:coverage

# UI интерфейс
npm run test:ui
```

### Структура тестов

```
src/
├── components/ui/__tests__/    # Тесты UI компонентов
├── store/__tests__/            # Тесты Zustand stores
└── test/
    ├── setup.ts                # Настройка тестовой среды
    └── test-utils.tsx          # Утилиты для тестирования
```

## CI/CD

Проект настроен для GitHub Actions:

- **Lint** - ESLint проверка
- **Type Check** - TypeScript проверка
- **Test** - Запуск тестов с coverage
- **Build** - Production сборка
- **Docker** - Сборка Docker образа (только main)

## API Интеграция

Backend API ожидается по адресу `/api`. Vite dev сервер проксирует запросы на `http://localhost:8080`.

### Аутентификация

- JWT токены (access + refresh)
- Автоматическое обновление токенов
- Защищённые маршруты

### WebSocket

STOMP протокол для real-time обновлений:
- Новые заказы
- Статусы курьеров
- Системные алерты

## Лицензия

Proprietary
