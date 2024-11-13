import { Abi, Address, parseAbi, parseAbiItem } from "viem";
import { GetClient } from "./client";
import erc721mAbi from "./abi.json";


const client = GetClient(59144)

export async function getTokenMetadata({
  chainId,
  address,
  tokenId,
  blockNumber,
}: {
  chainId: number;
  address: Address;
  tokenId: bigint;
  blockNumber?: number;
}) {
  // const client = GetClient(chainId);

  const config = { abi: erc721mAbi as Abi, address, args: [tokenId] };

  let contracts = [
    { ...config, functionName: "tokenURI" },
  ];


  const [uri] = await client.multicall({
    batchSize: 5000,
    contracts
  });
  return {
    uri: uri.result as string | undefined,
  }
}