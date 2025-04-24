# Rend

**Rend** is a Web3 content platform that redefines content engagement using **blockchain**, **gamification**, **staking**, and **AI**. Our mission is to empower creators and consumers by building a community-driven ecosystem where quality content is rewarded and users participate in governance and curation. Rend leverages decentralized technology and game mechanics to encourage active participation, fair rewards, and innovative content interactions.

## Mission and Vision

Rend’s vision is to **revolutionize how content is created, curated, and consumed**. We aim to move beyond traditional likes and comments by introducing **blockchain-backed incentives** and **AI-powered features** that promote genuine engagement. Key elements of our mission include:

- **Decentralization of Content**: Using blockchain (StarkNet via Cairo) to ensure transparency and ownership of content and interactions.
- **Gamified Participation**: Incorporating game-like elements (quests, leveling, rewards) to make contributing and curating content fun and rewarding.
- **Stakeholder Incentives**: Enabling staking mechanisms where users can stake tokens on content they believe in, aligning incentives between creators and reviewers.
- **AI Assistance**: Utilizing AI for content review scoring and moderation assistance, ensuring quality and safety while scaling the platform.
- **Community Governance**: Eventually transitioning to community-driven decision making (DAO governance), so the platform’s evolution is guided by its users.

Through this mission, **Rend** strives to create a platform where creators are fairly rewarded, reviewers earn by contributing honestly, and every user has a stake in the content ecosystem.

## Features (MVP)

Our Minimum Viable Product focuses on core features that demonstrate the platform’s value. The initial feature set includes:

- **Content Uploads**
- **Reviewer Incentives**
- **Staking System**
- **Token Rewards**
- **In-App eCommerce**
- **Custom Avatars**
- **Secure Authentication**
- **User Profiles**

## Tech Stack

Rend is built with a modern **full-stack** and **Web3**-focused technology stack:

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Smart Contracts**: Cairo (StarkNet)
- **Tools**: Jest (testing), Web3 libraries, Docker (optional)

## Project Folder Structure

rend/
├── backend/       # Node.js Express backend
├── frontend/      # Next.js frontend
├── onchain/       # Cairo smart contracts (StarkNet)
├── src/           # Shared utilities and typings
├── README.md      # Project overview and setup instructions
├── CONTRIBUTING.md
└── ...

## Getting Started

1. Clone the repository:

   ```bash
   git clone <https://github.com/coder-lounge/Rend>
   cd rend
   ```

1. Install dependencies for each part:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../onchain && npm install
   ```

1. Configure environment variables for backend, frontend, and onchain.

1. Run each service:

   ```bash
   # Backend
   cd backend
   npm run dev
   ```

   ```bash
   # Frontend
   cd ../frontend
   npm run dev
   ```

1. (Optional) Compile and deploy Cairo contracts:

   ```bash
   cd ../onchain

   # Assuming use of Protostar or similar
   protostar build
   protostar test
   ```

## Contribution

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on contributing to this project.

## Roadmap

- AI-Powered Review Scoring
- Prediction Markets for Content
- Quests and Achievements
- NFT-Based Avatars
- Mobile Support
- DAO Governance

## Community & Support

- **Telegram:** [Join us](https://t.me/+xbq5vDl38DcwMTdk)
- **GitHub Issues:** Use for bug reports and feature requests
- **OnlyDust:** Follow us for bounties and tasks

### Thank you for contributing to Rend 🚀