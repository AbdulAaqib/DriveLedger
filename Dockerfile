# Use an official Python base image (ARMv7 for Raspberry Pi)
FROM python:3.9-slim-bullseye

# Set working directory inside the container
WORKDIR /app

# Copy your local project files into the container
COPY . /app

# Install Python and system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        build-essential \
        libssl-dev && \
    apt-get clean

# Install Node.js and npm directly from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Verify installation of Node.js and npm
RUN node -v && npm -v

# Set the working directory to handle Node.js dependencies
WORKDIR /app/driverledger-deploy

# Install Node.js dependencies
RUN npm install

# Restore the working directory for Python
WORKDIR /app

# Install Python dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Default command to run your app
CMD ["python3", "main.py"]