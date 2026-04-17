---
title: "Week 10 — MLOps on GCP Part 2: Deploy & Monitor"
description: Deploy ML models on Cloud Run, set up model monitoring, build event-driven pipelines with Pub/Sub and Cloud Functions, manage artifacts, and optimize GCP costs.
sidebar_position: 10
---

# Week 10 — MLOps on GCP Part 2: Deploy & Monitor

Week 9 covered the foundations — GCP setup, Vertex AI training pipelines, and experiment tracking. This week we focus on the **deployment and operations** side of MLOps: getting models into production, keeping them healthy, reacting to events automatically, managing container artifacts securely, and doing all of this cost-effectively.

## Pages

| # | Page | Description |
|---|------|-------------|
| 1 | [Cloud Run for ML](./cloud-run-ml) | Deploy FastAPI model servers, GPU support, traffic splitting, autoscaling |
| 2 | [Model Monitoring](./model-monitoring) | Vertex AI Model Monitoring, drift & skew detection, alerting |
| 3 | [Pub/Sub + Cloud Functions](./pubsub-functions) | Event-driven triggers, automated retraining, Cloud Scheduler |
| 4 | [Artifact Registry](./artifact-registry) | Docker image registry, CI/CD push, vulnerability scanning |
| 5 | [Cost Optimization](./cost-optimization) | Free tier, committed use discounts, spot instances, budget alerts |

## Learning Outcomes

By the end of this week you will be able to:

- **Deploy** a FastAPI-based ML model server to Cloud Run with autoscaling and traffic splitting
- **Configure** Vertex AI Model Monitoring to detect feature drift and prediction skew
- **Build** event-driven pipelines using Pub/Sub, Cloud Functions, and Cloud Scheduler
- **Manage** Docker images in Artifact Registry with versioning and vulnerability scanning
- **Optimize** GCP spending through free tier usage, spot instances, budget alerts, and cost dashboards

## Prerequisites

- GCP account with billing enabled (Week 9)
- Familiarity with Docker (Week 2)
- Understanding of Vertex AI pipelines (Week 9)
- Basic Python and FastAPI knowledge (Week 2)

:::tip Lab Connection
Lab 8 — **Full MLOps on GCP** ties everything together: BigQuery ML training, Cloud Run serving, monitoring, and automated retraining. Start it after completing pages 1-3.
:::

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Cloud Run   │◄────│   Pub/Sub    │◄────│ Cloud        │
│  (ML Server) │     │  (Events)    │     │ Scheduler    │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│   Model      │     │   Cloud      │
│  Monitoring  │     │  Functions   │
│  (Drift/Skew)│     │ (Retraining) │
└──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│   Artifact   │
│  Registry    │
│  (Images)    │
└──────────────┘
```

All components are managed GCP services — no servers to maintain, pay only for what you use.
