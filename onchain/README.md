# Onchain - Rend (Cairo/StarkNet)

This directory contains the Cairo smart contracts and deployment/test scripts for the **onchain logic** of the Rend platform. These contracts govern staking, rewards, token distribution, and other blockchain interactions.

## 📁 Structure

onchain/
├── contracts/         # Cairo contracts (.cairo)
│   ├── Token.cairo    # Example token contract
│   └── Staking.cairo  # Example staking contract
├── scripts/           # Python-based deployment or interaction scripts
│   └── deploy_token.py
├── tests/             # Cairo test files
│   └── test_token.cairo
├── README.md          # This file

## 🔧 Setup

1. Install [Protostar](https://docs.swmansion.com/protostar/):
bash
curl -L <https://raw.githubusercontent.com/software-mansion/protostar/master/install.sh> | bash

2. Initialize the environment (if needed):
bash
protostar init

## 🛠 Compile Contracts

bash
protostar build

## 🧪 Run Tests

bash
protostar test

## 🚀 Deployment (example)

Deployment scripts can be written in Python using StarkNet's Python SDK or with Protostar.
bash
python3 scripts/deploy_token.py

Make sure you have your wallet, RPC URL, and StarkNet testnet account setup.

## 📌 Notes

- Contracts are written in **Cairo** targeting **StarkNet**.
- Modular, testable structure to scale reward mechanisms and staking pools.
- Favor composability and clarity in contract design.

For questions, issues, or feature ideas, check [CONTRIBUTING.md](../CONTRIBUTING.md).
