# syntax=docker/dockerfile:1
FROM python:3.12-slim

WORKDIR /app

COPY screening-service/requirements.txt .
# CPU-only torch wheel is ~10x smaller than the default CUDA build sentence-
# transformers would otherwise pull transitively from PyPI; this service
# never runs on a GPU. Installed first so it's already satisfied when
# sentence-transformers is installed below.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install torch --index-url https://download.pytorch.org/whl/cpu
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY screening-service/ .

EXPOSE 8000
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
