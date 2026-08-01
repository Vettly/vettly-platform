FROM python:3.11-slim AS base
WORKDIR /app
RUN adduser --disabled-password --gecos "" appuser

FROM base AS deps
ENV HF_HOME=/app/.cache/huggingface
COPY matching-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

FROM deps AS final
COPY matching-service/ .
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
