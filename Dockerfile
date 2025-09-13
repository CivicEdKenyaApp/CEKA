# Dockerfile (place this file at the project root)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build tools for packages that need compilation (optional, safe default)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker layer caching
COPY ./app/requirements.txt /app/requirements.txt

# Upgrade pip and install dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# Copy application source
COPY ./app /app

# Expose a port (adjust if your app listens on a different port)
EXPOSE 8080

# Run your app (ensure app/main.py is the correct entrypoint)
CMD ["python", "main.py"]
