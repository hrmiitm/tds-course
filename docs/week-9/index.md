---
title: Week 9 — MLOps on GCP Part 1
description: Train and evaluate ML models at scale using MLflow, Vertex AI, GCP Pipelines, BigQuery ML, and DVC for data versioning.
sidebar_position: 9
---

# Week 9 — MLOps on GCP Part 1: Train & Evaluate

This week kicks off our two-week deep dive into **MLOps on Google Cloud Platform**. We focus on the first half of the ML lifecycle: **training and evaluating models** at scale, with reproducibility, versioning, and automation as first-class concerns.

You'll learn how to track experiments with MLflow, train models on Vertex AI, orchestrate pipelines on GCP, build models directly inside BigQuery with SQL, and version your datasets with DVC. These are the building blocks of a production-grade ML system.

## Pages

| # | Page | Description |
|---|------|-------------|
| 1 | [MLflow](./mlflow) | Experiment tracking, model registry, and reproducible runs |
| 2 | [Vertex AI](./vertex-ai) | Managed notebooks, AutoML, custom training, and endpoints |
| 3 | [GCP ML Pipelines](./gcp-pipelines) | Kubeflow Pipelines on Vertex AI, DAGs, and scheduled runs |
| 4 | [BigQuery ML](./bigquery-ml) | Training models directly in SQL with CREATE MODEL |
| 5 | [Data Versioning with DVC](./data-versioning) | Version datasets, pipeline stages, and reproducible experiments |

## Learning Outcomes

By the end of this week, you will be able to:

- **Track ML experiments** with MLflow — log parameters, metrics, and artifacts; compare runs; and register champion models
- **Train models on Vertex AI** — use managed notebooks, submit AutoML and custom training jobs, and deploy to endpoints
- **Build ML pipelines** on GCP — define components and DAGs with the Kubeflow Pipelines SDK, and schedule recurring runs
- **Train models in BigQuery** — use `CREATE MODEL`, `ML.EVALUATE`, and `ML.PREDICT` to build ML models without leaving SQL
- **Version data with DVC** — track dataset changes, push to GCS remote storage, and reproduce experiments end-to-end

## Key Concepts

- **Experiment Tracking**: Systematic recording of every training run's parameters, metrics, and outputs
- **Managed ML**: Using cloud platforms (Vertex AI) instead of managing your own GPU infrastructure
- **ML Pipelines**: Automated, reproducible workflows defined as directed acyclic graphs (DAGs)
- **SQL-based ML**: Training models inside the data warehouse — no data movement needed
- **Data Versioning**: Treating datasets like code — versioned, tracked, and reproducible

## Prerequisites

Before starting this week, make sure you're comfortable with:

- Python and scikit-learn basics
- GCP account setup and gcloud CLI (Week 2)
- Docker fundamentals (Week 2)
- SQL querying basics

:::tip Lab Connection
Lab 8 — **Full MLOps on GCP** is the end-to-end capstone (BigQuery ML → Cloud Run → monitoring → retraining). Start it after completing pages 2 and 3.
:::
