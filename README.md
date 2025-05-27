# DriveLedger

**Description**
A Raspberry Pi-based system that retrieves simulated OBD (On-Board Diagnostics) data, classifies vehicle issues using AI, stores insights in Supabase, anchors proof-of-data on the blockchain, and visualizes everything on a web dashboard.


![oaicite:6](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)
![oaicite:8](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![oaicite:10](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=TensorFlow&logoColor=white) 
![oaicite:12](https://img.shields.io/badge/web3%20js-F16822?style=for-the-badge&logo=web3.js&logoColor=white)
![oaicite:14](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![oaicite:16](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![oaicite:18](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![oaicite:20](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![oaicite:22](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)                           

[1]: https://pypi.org/project/web3/?utm_source=chatgpt.com "web3 - PyPI"
[2]: https://vercel.com/geist/icons?utm_source=chatgpt.com "Icons - Vercel"
[3]: https://www.cleanpng.com/free/tensorflow.html?utm_source=chatgpt.com "Tensorflow PNG Images - CleanPNG"

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Workflow Status](#project-workflow-status)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Setup and Installation](#setup-and-installation)

   * [Prerequisites](#prerequisites)
   * [Environment Variables](#environment-variables)
   * [Docker Setup](#docker-setup)
6. [Usage](#usage)
7. [Screenshots / Preview](#screenshots--preview)
8. [Contributing](#contributing)
9. [License](#license)

---

## Project Overview

This project demonstrates how to collect, analyze, and share meaningful vehicle OBD data without altering the car. It runs on a Raspberry Pi (or any Docker-supported machine), simulates OBD-II data, applies AI-based classification, records immutable proofs on a blockchain testnet, stores structured logs in Supabase, and provides a React dashboard for visualization.

---

## Project Workflow Status

| Component                     | Status       | Notes                                                                 |
| ----------------------------- | ------------ | --------------------------------------------------------------------- |
| Simulated OBD Data Generator  | ✅ Complete   | `simulate_obd.py` generates realistic OBD-like sensor data.           |
| Supabase Schema + Integration | ✅ Complete   | Events and problems tables defined and data uploads working.          |
| AI Classification Logic       | ✅ Complete   | `classify.py` applies rule-based or trained model inference.          |
| Dockerized Python Pipeline    | ✅ Complete   | End-to-end pipeline runs in Docker, including Supabase upload.        |
| Blockchain Hashing & Logging  | ❌ Incomplete | `blockchain.py` setup pending for submitting hash to Sepolia testnet. |
| Frontend Dashboard            | ❌ Incomplete | React/TypeScript frontend scaffolded, fetching + display pending.     |
| Final Demo + Docs Polish      | ❌ Incomplete | Video/GIF and final visuals still in progress.                        |

---

## Tech Stack

| Layer            | Technology                         | Purpose                                  |
| ---------------- | ---------------------------------- | ---------------------------------------- |
| Data Source      | `python-obd` (simulated)           | Generate realistic OBD data (RPM, temp)  |
| AI               | `scikit-learn` / `TensorFlow Lite` | Fault classification (e.g., overheating) |
| Blockchain       | `web3.py`, Sepolia testnet         | Anchor hashed logs on-chain              |
| Storage          | Supabase (PostgreSQL)              | Store event logs and AI results          |
| Frontend         | React, TypeScript, Vercel          | Dashboard for real-time insights         |
| Containerization | Docker                             | Portable and reproducible deployment     |

---

## Folder Structure

```
DriveLedger/
├── Dockerfile             # Container setup for Python app
├── requirements.txt       # Python dependencies
├── main.py                # Orchestrator: data fetch -> classify -> upload
├── simulate_obd.py        # Simulate OBD data stream
├── classify.py            # AI model training & inference logic
├── supabase_client.py     # Supabase upload helper
├── blockchain.py          # Hash data & submit on-chain
└── frontend/              # React/TypeScript dashboard
    ├── package.json
    └── src/...
```

---

## Setup and Installation

### Prerequisites

* Docker & Docker Compose installed
* Python 3.9+
* Node.js & npm/yarn (for frontend)
* Supabase account & project
* Sepolia testnet funds

### Environment Variables

Create a `.env` file at project root with:

```ini
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-role-key

# Blockchain (Sepolia)
WEB3_PROVIDER_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your-wallet-private-key

# Misc
PI_DEVICE_ID=raspberry-pi-01
```

### Docker Setup

Build and run the service in Docker:

```bash
docker build -t vehicle-ai-blockchain .
docker run --env-file .env vehicle-ai-blockchain
```

---

## Usage

1. Clone the repo:

   ```bash
   git clone https://github.com/AbdulAaqib/DriveLedger.git
   cd DriveLedger
   ```
2. Populate `.env`.
3. Build and run with Docker (see above).
4. Access the frontend dashboard at `http://localhost:3000` (or your Vercel URL).

