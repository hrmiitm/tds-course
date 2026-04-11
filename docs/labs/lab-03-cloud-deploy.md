---
title: "Lab 3: End-to-End Cloud Deploy"
description: Build a complete MLOps pipeline on GCP.
sidebar_position: 3
---
# Lab 3: End-to-End Cloud Deploy
**Difficulty:** Advanced · **Estimated time:** ~4 hours

## Objective
Build a complete MLOps pipeline: Cloud Function → BigQuery ML → Cloud Run → Cloud Logging.

## Architecture
```
[Upload CSV] → [Cloud Function] → [BigQuery ML Training] → [Cloud Run Serving] → [Cloud Logging]
```

## Grading rubric
| Criterion | Points |
|---|---|
| Pipeline triggers automatically | 25 |
| BigQuery ML model trains | 20 |
| Cloud Run serves predictions | 20 |
| Cloud Logging captures logs | 15 |
| Monitoring alerts configured | 10 |
| Infrastructure reproducible | 10 |
| **Total** | **100** |
