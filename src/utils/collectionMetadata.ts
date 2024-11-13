import { Abi, Address } from "viem";
import { GetClient } from "./client";
import erc721mAbi from "./abi.json";

export async function getContractMetadata({
  chainId,
  address,
  blockNumber,
}: {
  chainId: number;
  address: Address;
  blockNumber?: bigint;
}) {
  const client = GetClient(chainId);

  const config = { blockNumber, abi: erc721mAbi as Abi, address };

  let contracts = [
    { ...config, functionName: "name" },
    { ...config, functionName: "symbol" },
    { ...config, functionName: "totalSupply" },
    { ...config, functionName: "contractURI" },
    { ...config, functionName: "owner" },
  ];

  const [name, symbol, maxSupply, contractUri, owner] = await client.multicall({
    batchSize: 10,
    contracts,
  });

  return {
    name: name.result as string | undefined,
    symbol: symbol.result as string | undefined,
    maxSupply: maxSupply.result as bigint,
    contractUri: contractUri.result as string | undefined,
    owner: owner.result as string | undefined,
  };
}
