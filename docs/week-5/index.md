---
title: Week 5 — Agentic AI & MCP
description: Build autonomous AI agents that reason, plan, and use tools. Learn the Model Context Protocol (MCP) for standardizing tool interactions and create multimodal agents.
sidebar_position: 5
---

# Week 5 — Agentic AI & MCP

This week marks the shift from **passive LLM usage** to **active agentic systems**. You'll learn how to build AI agents that can reason about problems, plan multi-step solutions, use external tools, and even reflect on their own outputs to improve.

We also cover the **Model Context Protocol (MCP)** — Anthropic's open standard for connecting AI models to external data sources and tools. By the end of this week, you'll have built agents that can browse the web, analyze images, and orchestrate complex workflows.

## Pages

| # | Page | Description |
|---|------|-------------|
| 1 | [LLM Agents](./llm-agents) | ReAct loop, plan-and-execute, reflexion patterns |
| 2 | [Pydantic AI](./pydantic-ai) | Defining agents, tool registration, structured output |
| 3 | [MCP Protocol](./mcp-protocol) | MCP architecture, client/server model |
| 4 | [MCP Server](./mcp-server) | Building custom MCP servers with FastMCP |
| 5 | [Multimodal Agents](./multimodal-agents) | Vision + tool use, image analysis, web browsing |
| 6 | [LangGraph](./langgraph) | Stateful multi-agent workflows and graph orchestration |

## Key Concepts

- **Agent Loop**: The core cycle of Observe → Think → Act → Reflect that powers autonomous agents
- **Tool Use**: How LLMs can call external functions, APIs, and services
- **MCP**: A universal protocol for connecting LLMs to tools and data sources
- **Multimodal Reasoning**: Combining text, image, and audio inputs for richer agent capabilities

## Prerequisites

Before starting this week, make sure you're comfortable with:

- Python async/await patterns
- FastAPI basics (Week 2)
- LLM function calling (Week 3)
- API design and REST conventions

:::tip Lab Connection
Lab 6 — **AI Agent + MCP** puts all of these concepts together into a full agentic system. Plan to start it after completing pages 3 and 4.
:::
