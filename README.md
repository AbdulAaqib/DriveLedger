# DriveLedger

**Description**
A Raspberry Pi-based system that retrieves simulated OBD (On-Board Diagnostics) data, classifies vehicle issues using AI, stores insights in Supabase, anchors proof-of-data on the Ethereum based Polygon Blockchain, and visualizes everything on a web dashboard.

**Link to Live Website : https://drive-ledger.vercel.app/**

**Tech Stack**


![oaicite:6](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)
![oaicite:6](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)
![oaicite:8](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![oaicite:10](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=TensorFlow&logoColor=white) 
![oaicite:12](https://img.shields.io/badge/web3%20js-F16822?style=for-the-badge&logo=web3.js&logoColor=white)
![oaicite:14](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![oaicite:16](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![oaicite:18](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![oaicite:20](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![oaicite:22](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![oaicite:22](https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black)


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
| Blockchain Hashing & Logging  | ✅ Complete   | `blockchain.py` setup pending for submitting hash to Polygon testnet. |
| Frontend Dashboard            | ✅ Complete | Next js React + TypeScript frontend scaffolded, fetching + display pending.     |


---

## Tech Stack

| Layer            | Technology                         | Purpose                                  |
| ---------------- | ---------------------------------- | ---------------------------------------- |
| Data Source      | `python-obd` (simulated)           | Generate realistic OBD data (RPM, temp)  |
| AI               | `scikit-learn` / `TensorFlow Lite` | Fault classification (e.g., overheating) |
| Blockchain       | `web3.py`, Polygon testnet         | Anchor hashed logs on-chain              |
| Storage          | Supabase (PostgreSQL)              | Store event logs and AI results          |
| Frontend         | Next js React, TypeScript, Vercel          | Dashboard for real-time insights         |
| Containerization | Docker                             | Portable and reproducible deployment     |

---

## Folder Structure

```
DriveLedger/
├── main.py                       # Master script: reads sensor data, runs ML, pins
│                                 # results to IPFS, logs to Supabase, mints NFT.
├── simulate_obd.py               # Generates / streams synthetic OBD-II readings.
├── supabase_client.py            # Small helper layer around the Supabase REST API.
│
├── generate_fake_training_data.py# Script to create synthetic datasets for model dev.
├── classify_tensorboard.py       # Visualise model-training metrics in TensorBoard.
├── export_all_to_csv.py          # Dump Supabase tables to CSV for offline analysis.
│
├── blockchain_commands.txt       # Handy on-chain CLI snippets & contract addresses.
├── training_data.csv             # Example raw training data (CSV format).
│
├── requirements.txt              # Python dependencies.
├── Dockerfile                    # Builds a Python + Node image so main.py can call
│                                 # `npx hardhat` inside the container.
│
├── package.json                  # Node dependencies (Hardhat, ethers, etc.).
├── package-lock.json             # Locked versions for reproducible Node builds.
│
├── used_ids.json                 # Local cache of already-minted NFT token IDs.
├── used_nonces.json              # (Optional) tracks contract nonces for advanced flows.
│
├── logs/                         # Trained ML artifacts.
│   └── …                         # e.g. model.tflite, scaler.pkl, fault_codes.pkl
│
├── obd_model_tf/                 # Original TensorFlow training notebooks/scripts.
│
├── driverledger-deploy/          # Hardhat project for Solidity contracts + mint script.
│   ├── scripts/mint.js           # Called by main.py to mint the NFT on Polygon.
│   └── …                         # Contracts, tests, Hardhat config, etc.
│
├── driveledgerwebsite/           # React/TypeScript front-end dashboard.
│   └── …                         # Components, pages, assets.
│
├── node_modules/                 # Installed automatically by npm / during Docker build.
└── __pycache__/                  # Python byte-code cache (auto-generated).
```

---

## Setup and Installation

### Prerequisites

* Docker & Docker Compose installed
* Python 3.9+
* Node.js & npm/yarn (for frontend)
* Supabase account & project
* Polygon testnet funds

### Environment Variables

Create a `.env` file at project root with:

```ini
# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# Blockchain (Polygon)
WEB3_PROVIDER_URL=
PRIVATE_KEY=

# Pinata IPFS
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
```

### Docker Setup

Build and run the service in Docker:

```bash
docker build -t driveledger .
docker run --rm driveledger
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

