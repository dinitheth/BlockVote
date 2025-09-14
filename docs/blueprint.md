# **App Name**: BlockVote

## Core Features:

- User Authentication: Secure user authentication via Privy Global Wallet and Abstract Global Wallet, including integration with their React SDKs, plus local storage.
- Smart Contract Integration: Interaction with the smart contract deployed on Abstract Mainnet using Web3.js or Ethers.js. Allows users to vote by calling the vote() method on the smart contract and display a message showing transaction status.
- Anonymous Voting Tool: Employ Zero-Knowledge Proofs using zkSync via Abstract's Layer-2 scaling solution for truly anonymous voting.
- Real-time Vote Tallying: Display the real-time vote counts fetched directly from the blockchain. Uses dynamic charts or graphs.
- Dark Mode/Light Mode Toggle: A button to switch between dark and light mode to enhance user experience, managed via CSS classes.
- Admin Interface: A protected page (password protection ok) to register elections and candidates; also starts/stops election.

## Style Guidelines:

- Primary color: Vibrant blue (#29ABE2) to evoke trust and security, reflecting blockchain's reliability.
- Background color: Light gray (#F0F2F5) for a clean and modern look, ensuring readability.
- Accent color: Orange (#FF9800) to highlight interactive elements and CTAs.
- Body text: 'Inter', a grotesque-style sans-serif, will provide a modern, objective feel.
- Headline text: 'Space Grotesk' sans-serif for headings to give a techy and scientific feel.
- Use minimalist icons representing voting actions and blockchain security.
- Clean, card-based layout to focus on key information, ensuring easy navigation and scannability.
- Subtle transitions on vote submission and results update for a smooth user experience.