# Rend

Rend is a gamified Web3 content ecosystem that empowers creators, reviewers, and communities by merging content creation with interactive, blockchain-powered rewards.

## Mission & Overview

Rend’s mission is to **redefine content engagement** using a blend of blockchain technology, gamification elements, and artificial intelligence. The platform creates an environment where **creators** can share content freely and **reviewers** are incentivized to participate in curation, ensuring that high-quality content rises to the top. By leveraging Web3 features (like token rewards and staking) and game-like mechanics (XP, badges, avatars, leaderboards), Rend makes the process of creating and engaging with content **fun, rewarding, and community-driven**.

The vision of Rend is to **empower creators and reviewers** alike. Creators can upload a wide range of content – from articles and books to videos and music – and earn rewards based on the community’s engagement with their work. Reviewers and community members are encouraged to provide valuable feedback and curation through a reward system of experience points (XP) and tokens. High-quality contributions are recognized with **achievement badges** and showcased on **leaderboards**, motivating participants to consistently contribute their best insights.

A unique aspect of Rend is its **staking-based interaction model**. Community members can stake the platform’s tokens to predict which content pieces or which creators will become popular or highly rated. If their predictions are correct, they earn rewards, adding a strategic, game-like layer to content discovery. This not only rewards proactive community members but also helps surface promising content. In the long term, Rend plans to integrate **AI-driven features** (such as automated review scoring or personalized content recommendations) to further enhance the curation process and user experience. Overall, Rend aims to build a vibrant, user-owned content platform where engagement is **rewarding, meritocratic, and fun**.

## Features (MVP)

- **Content Uploads**
- **Reviewer Incentives**
- **Dynamic Avatars**
- **Staking System**
- **Token Rewards**
- **In-App eCommerce**
- **Secure User Authentication**
- **Profiles and Access Control**

## Tech Stack

- **Backend:** Node.js (Express.js)
- **Frontend:** Next.js + TypeScript
- **Database:** MongoDB
- **Styling:** Tailwind CSS
- **Smart Contracts:** Cairo (StarkNet)

## Project Folder Structure

/root
├── backend        # Node.js Express backend
├── frontend       # Next.js frontend
├── onchain        # Cairo smart contracts
├── src            # Shared utilities and typings

## Contribution Guidelines

### Setup

git bash
git clone https://github.com/yourusername/rend.git
cd rend

#### Backend

git bash
cd backend
npm install
npm run dev

#### Frontend

git bash
cd ../frontend
npm install
npm run dev

### Environment Variables

- Configure `.env` files for both frontend and backend
- Backend: JWT_SECRET, MONGODB_URI, etc.
- Frontend: NEXT_PUBLIC_API_URL, etc.

### Testing (Jest)

git bash

# Backend tests

cd backend
npm test

### Branching & PRs
- Use `feature/`, `fix/`, `refactor/` prefixes
- Submit descriptive PRs
- Ensure linting & testing is done before pushing

### Onchain Contributions

- Cairo + StarkNet setup
- Use Protostar or other Cairo tools

### AI/ML Contributions

- Discuss via issues before integrating
- Keep services modular and API-based

## Roadmap

- Complete MVP
- AI Review Scoring
- Advanced Prediction Markets
- Community Quests
- Enhanced Avatar NFTs
- Mobile Support
- DAO-style Governance

## Community & Support

- **Telegram:** [Join us](https://t.me/+xbq5vDl38DcwMTdk)
- **GitHub Issues:** Use for bugs, ideas, and feature requests
- **OnlyDust:** Watch for bounties and tasks
**Thank you for contributing to Rend 🚀**