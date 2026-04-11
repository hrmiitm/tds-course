---
title: GCP Overview
description: Key GCP services for ML, IAM basics, and staying within the free tier.
sidebar_position: 1
---
# Google Cloud Platform for ML
## Services used in this course
| Service | What we use it for | Free tier limit |
|---|---|---|
| Cloud Run | Serving ML models as HTTP APIs | 2M requests/month |
| Cloud Storage | Storing datasets and model artifacts | 5 GB |
| BigQuery | Running SQL-based ML training | 10 GB storage |
| Cloud Functions | Lightweight event-driven scripts | 2M invocations/month |

## IAM
Never use the `owner` role in production. Create a service account with only necessary permissions.
