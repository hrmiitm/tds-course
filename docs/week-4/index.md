---
title: Week 4 — Retrieval-Augmented Generation
description: Build RAG systems with chunking, vector databases, hybrid search, reranking, and evaluation
sidebar_position: 4
---

# Week 4 — Retrieval-Augmented Generation

Large Language Models have a knowledge cutoff and cannot access your private data. Retrieval-Augmented Generation (RAG) solves this by fetching relevant documents from a knowledge base and feeding them to the LLM as context. This week, you will build a complete RAG pipeline from scratch.

## Overview

A RAG system has four main stages: (1) chunk documents into pieces, (2) store them in a vector database, (3) retrieve relevant chunks for a query, and (4) generate an answer using the LLM. This week covers each stage in depth, plus reranking for better retrieval and evaluation to measure quality.

## Pages

| # | Page | Topic |
|---|------|-------|
| 1 | [Chunking Strategies](./chunking-strategies) | Fixed-size, recursive, semantic chunking |
| 2 | [Vector Databases](./vector-databases) | FAISS, Chroma, PGVector, Qdrant |
| 3 | [Hybrid Search](./hybrid-search) | Dense + sparse (BM25) combination |
| 4 | [Reranking](./reranking) | Cross-encoders, Cohere Rerank |
| 5 | [RAG Evaluation](./rag-evaluation) | RAGAS framework, metrics |
| 6 | [Multimodal Embeddings](./multimodal-embeddings) | CLIP, image+text retrieval |
| 7 | [Contextual Retrieval](./contextual-retrieval) | Context-enriched chunks to reduce retrieval failures |
| 8 | [GraphRAG](./graphrag) | Knowledge graphs for multi-hop retrieval + reasoning |

## Learning Outcomes

By the end of this week, you will be able to:

- Apply appropriate chunking strategies based on document type and use case
- Store and query embeddings using vector databases (FAISS, Chroma, PGVector, Qdrant)
- Implement hybrid search combining dense and sparse retrieval for better results
- Use cross-encoder reranking to improve retrieval precision
- Evaluate RAG systems using the RAGAS framework with faithfulness and relevance metrics
- Build multimodal retrieval systems that search across text and images

:::tip Time estimate
Expect to spend 9-11 hours on this week's material: ~3 hours reading, ~4 hours on walkthroughs, and ~3 hours on the lab.
:::
