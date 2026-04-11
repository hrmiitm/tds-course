---
title: Environment Setup
description: Set up Git, Docker, Python virtual environments, and VS Code for MLOps development.
sidebar_position: 2
---
# Environment Setup
A clean, reproducible environment is the foundation of every MLOps project.

## 1. Git
```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## 2. Python 3.11
```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install numpy pandas scikit-learn mlflow
```

## 3. Docker
```bash
docker --version
docker run hello-world
```

## 4. VS Code + code-server
```bash
code-server --auth none --bind-addr 127.0.0.1:8080
cloudflared tunnel --url http://localhost:8080
```

:::tip Try it now
Press **Ctrl+`** to open the coding panel, paste your tunnel URL, and click Connect.
:::
