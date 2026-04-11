---
title: Cloud Run Deployment
description: Package and deploy your ML model as a Cloud Run service.
sidebar_position: 2
---
# Deploying to Cloud Run
## Push image to Artifact Registry
```bash
docker tag tds-pipeline:v1 asia-south1-docker.pkg.dev/YOUR_PROJECT/tds-repo/tds-pipeline:v1
docker push asia-south1-docker.pkg.dev/YOUR_PROJECT/tds-repo/tds-pipeline:v1
```

## Deploy
```bash
gcloud run deploy tds-model-server \
  --image asia-south1-docker.pkg.dev/YOUR_PROJECT/tds-repo/tds-pipeline:v1 \
  --region asia-south1 --platform managed --allow-unauthenticated
```

## Verify
```bash
curl https://tds-model-server-xxxx-el.a.run.app/predict \
  -X POST -H "Content-Type: application/json" \
  -d '{"features": [5.1, 3.5, 1.4, 0.2]}'
```
