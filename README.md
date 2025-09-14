# BlockVote: A Decentralized Voting Platform

BlockVote is a full-stack decentralized application (dApp) for creating and voting on proposals. It is built on the Abstract blockchain and provides a secure, transparent, and user-friendly interface for on-chain governance.

## Features

- **Wallet Integration**: Securely connect using an email address or a crypto wallet via Privy.
- **Proposal Creation**: Users can create new Yes/No proposals, which are submitted to the blockchain.
- **On-Chain Voting**: Connected users can cast their votes on active proposals.
- **Live Results**: View real-time voting results and progress for active proposals.
- **User Profile**: View and manage the proposals you have created.
- **Admin Panel**: A password-protected area for creating proposals with custom candidates.
- **Wallet Balance**: Displays the connected user's native token balance from the Abstract network.

## Tech Stack

- **Framework**: Next.js (React)
- **Blockchain Interaction**: ethers.js
- **Wallet Connection**: Privy
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Set Up Environment Variables

Before running the application, you need to configure your environment variables. Create a file named `.env.local` in the root of the project and add the following values:

```
# The public address of your deployed BlockVote smart contract
NEXT_PUBLIC_CONTRACT_ADDRESS="0x3Cc2935E31B4D9250Ff7f85EaB691B38A702C877"

# Your public App ID from Privy.io for wallet connections
NEXT_PUBLIC_PRIVY_APP_ID="YOUR_PRIVY_APP_ID"

# (Optional) Your private RPC URL for the blockchain network to avoid public rate limits
NEXT_PUBLIC_RPC_URL="https://api.mainnet.abs.xyz"

# Your API key from a block explorer (e.g., Etherscan) to fetch wallet balances
NEXT_PUBLIC_ETHERSCAN_API_KEY="JKSY95KC1N3SUE9N9BPD6VWYVTMN6MINDG"

```

**Note:** You must replace `"YOUR_PRIVY_APP_ID"` with your actual App ID from your Privy dashboard. The other values have been pre-filled based on our previous conversation.

### 2. Install Dependencies

Open your terminal, navigate to the project directory, and run the following command to install all the necessary packages:

```bash
npm install
```

### 3. Run the Development Server

Once the dependencies are installed, you can start the local development server:

```bash
npm run dev
```

The application will now be running at [http://localhost:3000](http://localhost:3000).

---

## How It Works

- **Smart Contract**: The core logic for proposals and voting is handled by a Solidity smart contract deployed on the Abstract blockchain. The application interacts with this contract to read and write data.
- **Frontend**: The Next.js application serves as the user interface, allowing users to interact with the smart contract's functions in a web browser.
- **Wallet Connection**: Privy handles user authentication and provides the necessary signer to authorize blockchain transactions (like voting or creating a proposal). All transactions are signed by the user in their own wallet.
- **Data Fetching**: The application fetches public data (like the list of proposals and current vote counts) by making read-only calls to the blockchain via an RPC endpoint. Wallet balances are fetched using the Etherscan API.
