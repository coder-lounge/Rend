# Contributing to Rend

We welcome contributions to **Rend**! This guide is structured to provide detailed information for contributing to all parts of the project—**backend**, **frontend**, and **onchain smart contracts**—while maintaining a consistent, high-quality codebase.

## 🧭 General Contribution Workflow

1. **Fork the repository**
   - Create a new branch from `main` (e.g., `feature/add-voting`, `fix/avatar-bug`).

2. **Setup the project locally**
   - Follow the relevant section below for backend, frontend, or onchain setup.

3. **Install dependencies and run tests**
   - Ensure all services are running correctly.
   - Run `npm test` where applicable.

4. **Follow coding standards**
   - Run linters: `npm run lint` or `npm run lint:fix`
   - Maintain naming conventions and write clean, readable code.

5. **Write or update tests**
   - Unit and integration tests are required for new features.
   - Ensure existing tests pass before opening a PR.

6. **Commit changes with clear messages**
   - Use [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat: add user authentication`
     - `fix: correct content ID bug`
     - `test: add coverage for rewards controller`

7. **Push your branch and open a Pull Request**
   - Link to any relevant issues (e.g., "Closes #123").
   - Include a summary of the changes and any notes for reviewers.

8. **Participate in the review process**
   - Be responsive to feedback.
   - Apply necessary changes to get the PR approved.

9. **Merge**
   - Once approved, the PR will be merged by a maintainer.

### 🖥️ Backend Contributions

- Located in the `/backend` directory.
- See README for installation steps, `.env` variables, and server setup.
- Key contributions include:
  - New API routes and controllers
  - MongoDB models
  - Middleware (e.g., for auth, rate limiting)
  - Jest/Supertest-based tests

**Best Practices:**

- Separate route logic, controllers, and models cleanly.
- Validate inputs using middleware.
- Return clear API responses and error codes.
- Use async/await with proper error handling.

### 💻 Frontend Contributions

- Located in the `/frontend` directory.
- Built with Next.js + TailwindCSS + TypeScript.
- See README for `.env.local` setup and dev server startup.

**Common Tasks:**

- Build or style React components
- Create/modify pages under `pages/`
- Write hooks, utility functions, or API handlers
- Integrate blockchain functionality (Web3 wallet, StarkNet.js)
- Use `React Testing Library` for tests

**Best Practices:**

- Keep components reusable and modular.
- Use `NEXT_PUBLIC_` prefix for any exposed environment variables.
- Ensure state logic is clean and testable.
- Keep styling consistent (Tailwind utility classes preferred).

### 🔗 Onchain Contributions (Smart Contracts)

- Located in the `/onchain` directory.
- Uses Cairo for StarkNet contracts.

**Development Tools:**

- [Protostar](https://docs.swmansion.com/protostar/docs/introduction) or [Scarb](https://docs.swmansion.com/scarb/)
- Cairo files: `.cairo`
- Tests: written in Cairo or Python (via `pytest`)

**Tasks Might Include:**

- Writing or modifying token/NFT contracts
- Logic for staking, rewards, gamification
- Onchain governance mechanisms

**Best Practices:**

- Follow StarkNet/Cairo syntax strictly.
- Write comprehensive unit tests for each contract.
- Optimize for low gas usage (StarkNet may still charge fees).
- Document your contract interfaces and functions clearly.

### 🧪 Testing Requirements

- **Backend:** `Jest` + `Supertest`
- **Frontend:** `Jest` + `React Testing Library`
- **Onchain:** Protostar/Cairo tests

Run:
bash
npm test        # backend or frontend
protostar test  # onchain

Include coverage reports (`--coverage`) where possible.

### 📌 Additional Notes

- **Code of Conduct:** Coming soon. All contributors are expected to act respectfully.
- **Security Issues:** Please do not report in public GitHub Issues. Email maintainers directly.
- **Feedback & Suggestions:** Feel free to open a discussion thread or start a new issue!

Thank you for contributing to Rend 🚀