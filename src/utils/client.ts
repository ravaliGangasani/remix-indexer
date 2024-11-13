import {Chain, createPublicClient, http } from "viem";
import { baseSepolia, sepolia, optimism, mainnet, base,linea } from "viem/chains";
export function GetClient(chainId: number) {
    let chain: Chain = optimism;
    if (chainId == 10) chain = optimism;
    if (chainId == 8453) chain = base;
    if (chainId == 11155111) chain = sepolia;
    if (chainId == 84532) chain = baseSepolia;
    if (chainId == 59144) chain = linea;
  
    return createPublicClient({
      chain: chain,
      transport: http(),
    });
  }
