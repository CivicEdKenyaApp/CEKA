# Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker layer caching
COPY ./app/requirements.txt /app/requirements.txt

# Upgrade pip and install numpy first with a compatible version
RUN pip install --upgrade pip
RUN pip install "numpy>=1.21.0,<1.25.0"  # Use a version compatible with your pandas

# Now install the rest of the requirements
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application source
COPY ./app /app

# Expose a port
EXPOSE 8080

# Run your app
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:8080", "--workers", "3", "--timeout", "120"]
