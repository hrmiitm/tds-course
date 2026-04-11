---
title: MLOps Overview
description: What MLOps is, why it matters, and where it fits in the ML lifecycle.
sidebar_position: 1
---
# MLOps Overview
**MLOps** (Machine Learning Operations) is the practice of applying DevOps principles to machine learning systems.

## The problem MLOps solves
A typical data science project starts clean but then reality sets in:
- The CSV path is hardcoded to your laptop.
- Nobody else can reproduce the results because you forgot to pin library versions.
- The model in production is three months old with no monitoring.

MLOps fixes each of these problems systematically.

## The three pillars
### 1. Reproducibility
Every experiment must produce the same result given the same inputs. This requires:
- Pinned dependency versions (`requirements.txt` or `pyproject.toml`).
- Versioned datasets (DVC or GCS bucket with paths).
- Tracked hyperparameters (MLflow, W&B).

### 2. Automation
No manual steps in the path from code commit to deployed model:
- CI/CD pipeline that runs tests and retrains on schedule.
- Containerised training jobs that run identically locally and in the cloud.

### 3. Monitoring
Know when your model is failing in production:
- Data drift detection.
- Prediction distribution tracking.
- Latency and error rate alerting.

:::info
The tools you learn here (Docker, Cloud Run, BigQuery) are transferable. The concepts apply equally to AWS or Azure.
:::
