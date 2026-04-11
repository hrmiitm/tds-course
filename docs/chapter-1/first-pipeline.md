---
title: Your First Pipeline
description: Build a simple end-to-end ML training and inference pipeline in Python.
sidebar_position: 3
---
# Your First Pipeline
Build a minimal but complete ML pipeline: **data → train → evaluate → save artifact → inference**.

## Project structure
```
tds-pipeline/
├── data/iris.csv
├── train.py
├── predict.py
├── requirements.txt
└── Dockerfile
```

## Training script
```python
import pandas as pd
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

df = pd.read_csv("data/iris.csv")
X = df.drop("target", axis=1)
y = df["target"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)
print("Model saved to model.pkl")
```

## Containerise it
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY data/ data/
COPY train.py predict.py ./
RUN python train.py
CMD ["python", "predict.py"]
```

```bash
docker build -t tds-pipeline:v1 .
docker run --rm tds-pipeline:v1
```

Congratulations — you have a reproducible, containerised ML pipeline.
