---
title: Command Cheatsheet
description: Quick reference for all CLI tools used in the TDS course.
sidebar_position: 2
---

# Command Cheatsheet

Quick reference for all CLI commands used throughout the course.

## Git

```bash
# Setup
git init
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
git config --global init.defaultBranch main

# Day-to-day
git status
git add .
git commit -m "feat: add new feature"
git push origin main
git pull --rebase

# Branching
git switch -c feature/my-feature
git merge feature/my-feature
git branch -d feature/my-feature

# History & Debug
git log --oneline --graph --all
git diff HEAD~1
git stash && git stash pop
git bisect start
git blame file.py

# GitHub CLI
gh pr create --fill
gh pr merge --squash
gh issue list
```

## Docker

```bash
# Build & Run
docker build -t myapp:v1 .
docker run --rm -p 8000:8000 myapp:v1
docker run -d --name myapp myapp:v1

# Manage
docker ps -a
docker images
docker exec -it <container_id> bash
docker logs -f <container_id>

# Compose
docker compose up -d
docker compose down
docker compose logs -f

# Cleanup
docker system prune -af
docker volume prune

# Multi-stage build
docker build --target runtime -t myapp:prod .
```

## gcloud

```bash
# Setup
gcloud auth login
gcloud config set project YOUR_PROJECT

# Cloud Run
gcloud run deploy SERVICE --image IMAGE --region asia-south1
gcloud run services list
gcloud run logs read --service=SERVICE --limit=50

# Storage
gcloud storage cp file.txt gs://bucket/path/
gcloud storage ls gs://bucket/

# BigQuery
bq query "SELECT * FROM dataset.table LIMIT 10"
bq mk dataset_name
bq load --source_format=CSV dataset.table data.csv

# IAM
gcloud iam service-accounts create my-sa
gcloud projects add-iam-policy-binding PROJECT \
  --member="serviceAccount:my-sa@PROJECT.iam" \
  --role="roles/run.invoker"

# Artifact Registry
gcloud artifacts repositories create tds-repo --repository-format=docker --location=asia-south1
docker push asia-south1-docker.pkg.dev/PROJECT/tds-repo/image:tag
```

## Python / uv

```bash
# uv project management
uv init
uv add fastapi uvicorn
uv remove package-name
uv run python script.py
uv sync

# Traditional pip
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip freeze > requirements.txt

# Testing
python -m pytest tests/ -v
python -m pytest --cov=src tests/

# Formatting & linting
pip install ruff
ruff check .
ruff format .
```

## code-server (local) / remote access

```bash
# Install (Linux)
curl -fsSL https://code-server.dev/install.sh | sh

# Start code-server
code-server --auth none --bind-addr 127.0.0.1:8080

# Optional: expose your port via your preferred tunnel / reverse proxy
# (or use GitHub Codespaces port forwarding)
ngrok http 8080
```

## LLM CLI

```bash
# Basic usage
llm "What is RAG?"
llm -m gpt-4 "Explain MLOps"

# With templates
llm -t summary < article.txt

# Chat mode
llm chat -m gpt-4

# Install plugins
llm install llm-claude
```

## DVC

```bash
# Initialize
dvc init

# Track data
dvc add data/dataset.csv
git add data/dataset.csv.dvc

# Remote storage
dvc remote add -d myremote gcs://my-bucket/dvc
dvc push
dvc pull

# Pipeline
dvc repro
dvc dag
dvc metrics show
```
