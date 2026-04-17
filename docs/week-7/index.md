---
title: Week 7 — Finetuning & Publishing
description: Learn when and how to finetune LLMs, navigate the HuggingFace ecosystem, and publish Python packages to PyPI.
sidebar_position: 7
---

# Week 7 — Finetuning & Publishing

This week covers two crucial skills for the AI engineer: **finetuning models** for domain-specific tasks and **publishing code** as reusable Python packages. You'll learn when finetuning makes sense (vs. RAG or prompting), how to use QLoRA for efficient training, and how to package and publish your work.

## Pages

| # | Page | Description |
|---|------|-------------|
| 1 | [Finetuning Strategy](./finetuning-strategy) | When to finetune vs RAG vs prompting |
| 2 | [Gemma Finetuning](./gemma-finetuning) | QLoRA with Unsloth (with code) |
| 3 | [HuggingFace Ecosystem](./huggingface-ecosystem) | Datasets, Transformers, PEFT, TRL |
| 4 | [Python Packaging](./python-packaging) | pyproject.toml, src layout, versioning |
| 5 | [PyPI Publishing](./pypi-publishing) | uv build, uv publish, GitHub Actions release |
| 6 | [DPO Finetuning](./dpo-finetuning) | Preference optimization for alignment |
| 7 | [uv tools / uvx](./uv-tools-uvx) | Ship and run CLIs cleanly |

## Key Concepts

- **Finetuning**: Adapting a pretrained model to a specific task or domain
- **QLoRA**: Quantized Low-Rank Adaptation — train with minimal GPU memory
- **Python Packaging**: Structuring and distributing reusable code
- **Continuous Publishing**: Automated release pipelines via GitHub Actions

## Prerequisites

- Understanding of LLM fundamentals (Week 3)
- Python project structure basics
- GitHub familiarity (Week 1)

:::tip Lab Connection
Lab 3 — **Gemma4 Finetuning** walks you through the complete finetuning pipeline. Start it after completing page 2.
:::
