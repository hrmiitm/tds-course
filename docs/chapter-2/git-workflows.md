---
title: Git Workflows
description: Branching strategies, semantic commits, and pull request practices for ML teams.
sidebar_position: 1
---
# Git Workflows for ML Teams
Good Git practices prevent "works on my machine" failures.

## Trunk-based development
- One protected main branch (`main`).
- Short-lived feature branches (< 2 days of work).
- All merges go through a pull request.

## Semantic commit messages
```
feat: add SMOTE oversampling to preprocessing pipeline
fix: handle NaN values in feature engineering step
docs: add usage examples to README
refactor: extract model evaluation into separate module
```

## Useful .gitignore for ML
```gitignore
__pycache__/
.venv/
*.pkl
*.h5
/data/raw/
.env
```
