# Use official lightweight Python image
FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose Cloud Run default port 8080
ENV PORT 8080
EXPOSE 8080

CMD ["python", "api_server.py"]
