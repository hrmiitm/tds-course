---
title: Command Cheatsheet
description: Quick reference for all CLI tools used in the TDS course.
sidebar_position: 2
---
# Command Cheatsheet
## Git
```bash
git init && git add . && git commit -m "feat: initial commit"
git switch -c feature/my-feature
git log --oneline --graph --all
```

## Docker
```bash
docker build -t myimage:v1 .
docker run --rm -p 8000:8000 myimage:v1
docker system prune -af
```

## GCP / gcloud
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT
gcloud run deploy SERVICE --image IMAGE --region asia-south1
gcloud logs read --service=SERVICE --limit=50
```

## code-server / tunnel
```bash
code-server --auth none --bind-addr 127.0.0.1:8080 &
cloudflared tunnel --url http://localhost:8080
```
