---
title: "Lab 2: Containerise and Serve"
description: Package a FastAPI application in Docker and deploy to Cloud Run.
sidebar_position: 2
---
# Lab 2: Containerise and Serve
**Difficulty:** Intermediate · **Estimated time:** ~3 hours

## Objective
Wrap Lab 1 pipeline in a FastAPI app with `/predict` and `/health` endpoints, write a multi-stage Dockerfile, and deploy to Cloud Run.

## Grading rubric
| Criterion | Points |
|---|---|
| FastAPI `/predict` works correctly | 25 |
| Multi-stage Dockerfile | 25 |
| Successfully deployed to Cloud Run | 20 |
| `/health` returns 200 | 10 |
| Docker image < 500MB | 10 |
| README with deployed URL | 10 |
| **Total** | **100** |
