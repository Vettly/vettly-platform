FROM python:3.12-slim

WORKDIR /app

COPY screening-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY screening-service/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
