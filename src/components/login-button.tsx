'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogIn, LogOut, User, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

export function LoginButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authenticated || !user?.wallet || !ETHERSCAN_API_KEY) {
        setBalance(null);
        return;
      }
      try {
        const address = user.wallet.address;
        const chainId = '2741'; // Abstract Testnet, needs to be updated if it's mainnet
        const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}&chainid=${chainId}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === '1') {
          const walletBalance = data.result;
          const formattedBalance = parseFloat(ethers.formatEther(walletBalance)).toFixed(4);
          // Assuming the native currency of Abstract is ABS, will need to confirm.
          setBalance(`${formattedBalance} ABS`); 
        } else {
          console.error('Failed to fetch balance from Etherscan:', data.message);
          setBalance('Error');
        }

      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
        setBalance('Error');
      }
    };

    fetchBalance();
    // Re-fetch balance on a timer or when certain events happen
    const interval = setInterval(fetchBalance, 30000); // every 30 seconds

    return () => clearInterval(interval);

  }, [authenticated, user?.wallet?.address]);


  if (!ready) {
    return null;
  }

  if (!authenticated) {
    return (
      <Button onClick={login}>
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
    );
  }

  const userInitial = user?.email
    ? user.email.address[0].toUpperCase()
    : user?.wallet
    ? user.wallet.address[2].toUpperCase()
    : '?';
    
  const userIdentifier = user?.email?.address || user?.wallet?.address;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="#" alt="User avatar" />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Logged In</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {userIdentifier}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {balance !== null && (
           <DropdownMenuItem disabled>
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Balance</span>
                </div>
                <span className="text-muted-foreground">{balance}</span>
            </div>
           </DropdownMenuItem>
        )}
         <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
