# Use an official Python base image (ARMv7 for Raspberry Pi)
FROM python:3.9-slim-bullseye

# Set working directory inside container
WORKDIR /app

# Copy your local project files into the container
COPY . /app

# Install Python packages from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Default command to run your app (edit as needed)
CMD ["python3", "main.py"]
