# GuaFi Protocol 🍉

**吃瓜，赚币 | Eat Melon, Earn Crypto**

GuaFi is a decentralized protocol for trading and sharing verifiable rumors on the Sui blockchain. It combines encryption (Sui Seal), decentralized storage (Walrus), and smart contract logic to create a trustless marketplace for exclusive information.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Sui](https://img.shields.io/badge/Built%20with-Sui-4DA2FF)](https://sui.io)
[![Powered by Walrus](https://img.shields.io/badge/Powered%20by-Walrus-00D4AA)](https://walrus.site)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

### The Problem

- **Information Asymmetry**: Valuable information is difficult to price and verify
- **Instant Devaluation**: Once shared, information loses value immediately
- **Trust Issues**: How to prove authenticity without revealing content?

### The Solution

GuaFi creates a **pay-to-reveal** mechanism where:

1. **Creators** encrypt and upload exclusive content (PDF files)
2. **Participants** pay SUI to join and unlock secrets once a threshold is met
3. **Revenue Sharing** incentivizes early adoption through profit distribution

The protocol ensures content remains encrypted until the minimum participant threshold is reached, creating game-theoretic incentives for viral growth.

---

## ✨ Features

### Core Functionality

- 🔐 **Client-Side Encryption**: Content encrypted locally using Sui Seal before upload
- 💰 **Pay-to-Reveal Mechanism**: Users pay SUI to access encrypted content
- 👥 **Threshold-Based Unlocking**: Content unlocks when minimum participants join
- 💸 **Automated Revenue Distribution**: 
  - Creators earn 50% of entry fees
  - Early participants share remaining 48% proportionally
  - Protocol fee: 2%

### User Experience

- 🌏 **Multi-Language Support**: Full English/Chinese (简体中文) localization
- 🎨 **"Manga Pop" Design**: High-contrast, comic-style UI with bold typography
- 📱 **Responsive Layout**: Works seamlessly on desktop and mobile
- 🔄 **Real-Time Updates**: React Query for automatic data synchronization
- 🐦 **Social Sharing**: One-click share to X (Twitter)

### Profile Features

- 📊 **User Statistics**: Track spent, earned, and participation metrics
- 📋 **Created Rumors**: View all rumors you've published
- 🎫 **Participated Rumors**: Manage tickets and claim rewards
- 💰 **Reward Tracking**: Monitor pending and claimed earnings

---

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Query** (@tanstack/react-query) for state management
- **i18next** for internationalization

### Blockchain & Storage

- **Sui Move** smart contracts
- **@mysten/dapp-kit** for wallet integration
- **Walrus SDK** for decentralized storage
- **Sui Seal SDK** for encryption and access control

### Development Tools

- **Bun** as package manager and runtime
- **ESLint** for code quality
- **TypeScript** for type safety

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ RumorList    │  │ RumorDetail  │  │ Profile      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼────────┐    ┌──────▼───────┐
        │  Sui Blockchain │    │ Walrus Store │
        │                 │    │              │
        │ - Rumor Objects │    │ - Encrypted  │
        │ - Ticket NFTs   │    │   Blobs      │
        │ - Payments      │    │              │
        │ - Rewards       │    │              │
        └────────┬────────┘    └──────────────┘
                 │
        ┌────────▼────────┐
        │   Sui Seal      │
        │                 │
        │ - Encryption    │
        │ - Key Mgmt      │
        │ - Access Ctrl   │
        └─────────────────┘
```

### Data Flow

1. **Create Rumor**: User uploads PDF → Seal encrypts → Walrus stores → Sui mints Rumor NFT
2. **Join Rumor**: User pays SUI → Sui mints Ticket NFT → User waits for threshold
3. **Unlock**: Threshold met → Participants can decrypt → Seal verifies Ticket → Walrus serves content
4. **Claim Rewards**: User triggers claim → Sui calculates share → Transfers SUI to user

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ or **Bun** v1.0+
- **Sui Wallet** (browser extension)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/EATMove/guafi.git
cd guafi
```

2. **Install dependencies**

```bash
cd frontend
bun install
```

3. **Configure environment variables**

Create `.env` file in `frontend/` directory:

```env
# Sui Network Configuration
VITE_SUI_NETWORK=testnet  # or mainnet

# GuaFi Protocol Configuration
VITE_PACKAGE_ID=0x...      # Your deployed package ID
VITE_CONFIG_ID=0x...       # Global config object ID
```

4. **Start development server**

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
bun run build
```

The production build will be in the `dist/` folder.

---

## 📖 Usage

### Creating a Rumor

1. Connect your Sui wallet
2. Navigate to "Create Rumor" page
3. Fill in:
   - **Title**: Catchy headline
   - **Description**: Preview of what's inside
   - **PDF File**: Your exclusive content (encrypted automatically)
   - **Price**: Entry fee in SUI (e.g., 0.1 SUI)
   - **Min Participants**: Unlock threshold (e.g., 10)
4. Click "Create Rumor" and confirm transaction
5. Your content is now encrypted and uploaded!

### Joining a Rumor

1. Browse available rumors on the home page
2. Click on a rumor to view details
3. Click "Pay & Join" and confirm payment
4. Receive a Ticket NFT
5. Wait for the participant threshold to be met
6. Once unlocked, click "Reveal Content" to decrypt

### Claiming Rewards

1. Go to your Profile page
2. View "Participated Rumors" section
3. Rumors with claimable rewards show the amount
4. Click "Claim" to receive your share
5. Rewards are automatically calculated based on:
   - When you joined (earlier = larger share)
   - Total reward pool from subsequent entries

### Sharing on Social Media

- On any rumor detail page, click **"Share to X"** button
- Customize your message and post to attract more participants
- More participants = larger reward pool for everyone!

---

## 📁 Project Structure

```
guafi/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   │   ├── logo.png         # GuaFi logo (watermelon)
│   │   ├── yaoming.png      # Meme assets
│   │   └── wangnima.png     
│   ├── src/
│   │   ├── assets/          # Image assets
│   │   ├── components/      # React components
│   │   │   ├── rumor/       # Rumor-specific components
│   │   │   │   ├── RumorCard.tsx
│   │   │   │   ├── RumorDashboard.tsx
│   │   │   │   ├── JoinPanel.tsx
│   │   │   │   └── SecretContent.tsx
│   │   │   └── ui/          # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── Input.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useRumors.ts
│   │   │   ├── useRumorDetail.ts
│   │   │   ├── useJoinRumor.ts
│   │   │   └── useDecryptRumor.ts
│   │   ├── lib/             # Utility libraries
│   │   │   ├── config.ts    # Environment configuration
│   │   │   ├── format.ts    # Formatters (SUI, addresses)
│   │   │   ├── rumorParse.ts # Blockchain data parsers
│   │   │   ├── stats.ts     # User statistics calculators
│   │   │   ├── seal/        # Sui Seal integration
│   │   │   │   └── index.ts
│   │   │   └── walrus/      # Walrus storage integration
│   │   │       ├── downloadHTTP.ts
│   │   │       └── uploadHTTP.ts
│   │   ├── pages/           # Page components
│   │   │   ├── RumorList.tsx
│   │   │   ├── RumorDetail.tsx
│   │   │   ├── CreateRumor.tsx
│   │   │   └── Profile.tsx
│   │   ├── i18n.ts          # Internationalization config
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts
├── move/                     # Sui Move smart contracts
│   └── sources/
│       └── guafi.move       # Main contract
└── README.md                # This file
```

## 🔒 Security Considerations

### Encryption

- Content is encrypted **client-side** using Sui Seal before any upload
- Only users with valid Ticket NFTs can request decryption
- Seal SDK verifies ownership on-chain before releasing keys

### Privacy

- Encrypted blobs on Walrus are inaccessible without proper authorization
- Creator addresses are public (by design) but participants remain pseudonymous
- No personal data is stored or tracked

### Smart Contract Safety

- Revenue distribution enforced by Move contract logic
- Ticket NFTs are non-transferable to prevent ticket scalping
- Threshold mechanism prevents premature content leakage

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (ESLint configuration)
- Add TypeScript types for all new code
- Test thoroughly before submitting PR
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Sui Foundation** for the blockchain infrastructure
- **Walrus Team** for decentralized storage
- **Seal SDK** for privacy-preserving encryption
- **Mysten Labs** for excellent developer tools

---

## 🗺️ Roadmap （If we got grants）

### Phase 1: MVP ✅
- [x] Basic create/join/reveal flow
- [x] Client-side encryption with Seal
- [x] Walrus integration for storage
- [x] Multi-language support (EN/CN)
- [x] Profile and statistics page
- [x] Social sharing features

### Phase 2: Enhanced Features (Q1 2026)
- [ ] Reputation system for creators
- [ ] Advanced analytics dashboard
- [ ] Mobile-optimized responsive design
- [ ] Notification system

### Phase 3: Ecosystem Growth (Q2 2026)
- [ ] DAO governance for protocol parameters
- [ ] Mobile app (iOS/Android)
- [ ] Cross-chain bridges
- [ ] NFT marketplace for popular rumors

### Phase 4: Advanced Features (Q3 2026)
- [ ] AI-powered content verification
- [ ] Dispute resolution mechanism
- [ ] Anonymous creation (ZK proofs)
- [ ] Content derivatives and futures trading

---

**Built with ❤️ by the GuaFi team**

*Let's make gossip profitable. Let's eat melon together.* 🍉
