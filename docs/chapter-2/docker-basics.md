---
title: Docker Basics
description: Images, layers, multi-stage builds, and Docker Compose for ML projects.
sidebar_position: 2
---
# Docker for ML Projects
Docker packages your code, runtime, and dependencies into a single portable image.

## Key concepts
| Concept | What it is |
|---|---|
| Image | A read-only blueprint for a container |
| Container | A running instance of an image |
| Layer | A cached filesystem change |

## Production Dockerfile
```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim AS runtime
RUN useradd --create-home appuser
WORKDIR /home/appuser/app
COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser src/ ./src/
USER appuser
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Docker Compose
```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    volumes:
      - ./src:/home/appuser/app/src:ro
  redis:
    image: redis:7-alpine
```
