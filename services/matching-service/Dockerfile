# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base
WORKDIR /app
RUN adduser --disabled-password --gecos "" appuser

FROM base AS deps
ENV HF_HOME=/app/.cache/huggingface
COPY matching-service/requirements.txt .
# CPU-only torch wheel is ~10x smaller than the default CUDA build pulled from
# PyPI, and this service never runs on a GPU. Installed first so the
# requirements.txt install below finds it already satisfied and skips it.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install torch==2.4.1 --index-url https://download.pytorch.org/whl/cpu
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

FROM deps AS final
COPY matching-service/ .
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
