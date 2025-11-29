# AI-ассистент ПСБ для генерации деловой переписки  
Система автоматического анализа входящих писем и генерации официальных ответов на основе локальной AI-модели.

---

## Цель проекта
Создать корпоративный инструмент, который:

- анализирует входящие письма в PDF/TXT;
- автоматически классифицирует их тип;
- извлекает ключевые признаки (организация, даты, требования);
- формирует несколько вариантов черновиков ответов;
- предоставляет сотруднику удобный интерфейс для редактирования и сохранения.

---

## Архитектура

Компоненты проекта:

```
correspondence/
│
├── backend/           # Spring Boot, JWT, PostgreSQL
├── Frontend/          # React + Bootstrap + Axios
├── ML/                # ML-модели
├── docker-compose.yml # БД
└── README.md
```

### Основные сервисы

| Компонент         | Технология                     | Описание |
|------------------|--------------------------------|----------|
| Backend (API)    | Spring Boot 3 (Kotlin)         | Обработка писем, генерация черновиков, хранение метаданных, JWT |
| AI Engine        | Transformers, PyTorch     | ruBERT + YandexGPT|
| DB               | PostgreSQL                     | Хранение писем, черновиков и истории |
| Frontend         | React                          | UI для сотрудников банка |

---

# Быстрый старт

## 1) Клонировать репозиторий
```bash
git clone git@github.com:KirillZHur/WW_Team_AIChellenge.git
```

## 2) Запуск всей системы
```bash
docker compose up -d
```

## 3) Открыть в браузере
```
http://localhost:3000
```

---

# Как работает система

### 1) Пользователь загружает файл
Фронт отправляет:
```
POST /api/v1/letters
multipart/form-data
```

Содержимое:
- файл (pdf/txt)
- название генерации

### 2) Backend принимает письмо
- сохраняет файл в БД
- извлекает текст
- отправляет запросы к моделям
- создаёт запись в БД

### 3) AI-модель создает черновики
Backend вызывает YandexGPT:

```
POST /letters/{id}/drafts
```

Генерируются *3 варианта* ответа:
- строгий официальный  
- деловой корпоративный  
- клиентоориентированный  

### 4) Frontend отображает:
- список версий черновиков  
- выбранный вариант  
- возможности редактирования  
- системный пересказ  
- ключевые факты  
- принятый стиль
- история ответов

---

# Запуск Backend вручную (без Docker)

### dev-профиль
```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

---

# API

### Создание письма
```
POST /api/v1/letters
Content-Type: multipart/form-data
```

### Получение черновиков
```
GET /api/v1/letters/{letterId}/drafts
```

---

# Frontend

### dev-режим
```bash
cd frontend
npm install
npm start
```

### prod-сборка
```bash
npm run build
```

---

# Стек технологий

### Backend
- Kotlin + Spring Boot 3
- Spring Security + JWT
- PostgreSQL + Liquibase
- Swagger

### AI
- PyTorch
- HuggingFace Transformers
- YandexGPT
- ruBERT

### Frontend
- React
- React Bootstrap
- Axios
- SimpleBar

---


