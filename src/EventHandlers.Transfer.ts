import { Collection, ImplementationContract, Token, Transfer, User, UserChainInfo } from "generated";
import { formatToAddress } from "./utils/stringformat";
import { getContractMetadata } from "./utils/collectionMetadata";
import { TryFetchIpfsFile } from "./utils/fetchIPFS";
import { format } from "node:path/win32";
import { config } from "chai";

ImplementationContract.Transfer.handler(async ({event, context}) => {
    let contractSymbol: string | undefined
  let contractName: string | undefined
  let tokenMaxSupply: bigint | undefined
  let contractURI: string | undefined
  let collectionOwner: string | undefined
  let tokenmaxSupply = BigInt(0)

  let collectionId = `${event.chainId}:${event.srcAddress.toLowerCase()}`
  let collectionEntity = await context.Collection.get(collectionId)
  if (collectionEntity === undefined) {
    let chainId = event.chainId
    let address = formatToAddress(event.srcAddress)
    const { name, symbol, maxSupply, contractUri, owner } = await getContractMetadata({
      chainId,
      address
    })
    contractSymbol = symbol
    contractName = name
    tokenMaxSupply = maxSupply
    contractURI = contractUri
    collectionOwner = owner

    let collectionOwnerId = `${event.chainId}:${collectionOwner?.toLowerCase()}`
    let collectionMetadata = contractURI ? (await TryFetchIpfsFile(contractURI)) as any : ""
    let collectionObject: Collection = {
      address: event.srcAddress.toLowerCase(),
      chain: BigInt(event.chainId),
      createdAt: BigInt(event.block.timestamp),
      createdBlock: BigInt(event.block.number),
      creator_id: collectionOwnerId,
      factory_id: undefined,
      id: collectionId,
      isPaused: undefined,
      maxSupply: BigInt(1),
      metadatacontent: JSON.stringify(collectionMetadata),
      metadatauri: contractURI,
      isFeatured: false,
      name: contractName,
      owner_id: collectionOwnerId,
      symbol: contractSymbol,
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number),
      error: undefined,
      baseCollectionId:"",
      baseTokenId:"",
      collectionType: "COLLECTION"
    }

    context.Collection.set(collectionObject)

  } else {
    let tokenmaxSupply = collectionEntity?.maxSupply ?? BigInt(1); // Initialize with maxSupply if available, otherwise 0
    if (event.params.from === "0x0000000000000000000000000000000000000000") {
      // Increment maxSupply only if it's a mint event (from zero address)
      tokenmaxSupply = tokenmaxSupply + BigInt(1);
    }

    let collectionObject = {
      ...collectionEntity,
      maxSupply: tokenmaxSupply,
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }
    context.Collection.set(collectionObject)
  }

  // id is chainid:collectionid:tokenid
  const tokenId = `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.params.tokenId.toString()}`

  // Users 
  let fromObject = await context.User.get(event.params.from.toLowerCase())
  if (fromObject === undefined) {
    let fromEntity: User = {
      createdAt: BigInt(event.block.timestamp),
      createdBlock: BigInt(event.block.number),
      id: event.params.from.toLowerCase(),
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }

    context.User.set(fromEntity)
  } else {
    const fromEntity = {
      ...fromObject,
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }
    context.User.set(fromEntity)
  }

  let fromUserChainInfoId = `${event.chainId}:${event.params.from.toLowerCase()}`
  let fromUserChainInfo = await context.UserChainInfo.get(fromUserChainInfoId)
  if (fromUserChainInfo === undefined) {
    let fromUserChainInfoEntity: UserChainInfo = {
      address: event.params.from.toLowerCase(),
      chain: BigInt(event.chainId),
      id: fromUserChainInfoId,
      user_id: event.params.from.toLowerCase(),

      createdAt: BigInt(event.block.timestamp),
      createdBlock: BigInt(event.block.number),
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }

    context.UserChainInfo.set(fromUserChainInfoEntity)
  } else {
    let fromUserChainInfoEntity = {
      ...fromUserChainInfo,
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)

    }
    context.UserChainInfo.set(fromUserChainInfoEntity)
  }

  let toObject = await context.User.get(event.params.to.toLowerCase())
  if (toObject === undefined) {
    let toEntity: User = {
      createdAt: BigInt(event.block.timestamp),
      createdBlock: BigInt(event.block.number),
      id: event.params.to.toLowerCase(),
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }

    context.User.set(toEntity)
  } else {
    let toEntity = {
      ...toObject,
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }

    context.User.set(toEntity)
  }

  let toUserChainInfoId = `${event.chainId}:${event.params.to.toLowerCase()}`
  let toUserChainInfo = await context.UserChainInfo.get(toUserChainInfoId)
  if (toUserChainInfo === undefined) {
    let toUserChainInfoEntity: UserChainInfo = {
      address: event.params.to.toLowerCase(),
      chain: BigInt(event.chainId),
      id: toUserChainInfoId,
      user_id: event.params.to.toLowerCase(),

      createdAt: BigInt(event.block.timestamp),
      createdBlock: BigInt(event.block.number),
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }

    context.UserChainInfo.set(toUserChainInfoEntity)
  } else {
    let toUserChainInfoEntity = {
      ...toUserChainInfo,
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)

    }
    context.UserChainInfo.set(toUserChainInfoEntity)
  }


  let collentity = await context.Collection.get(collectionId)
  const transferId = `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}:${event.logIndex}`

  console.log("Activity Transfer", transferId)
  // Store Transfer activity 
  let transfer: Transfer = {
    actiontype: event.params.from === "0x0000000000000000000000000000000000000000" ? "mint" : "transfer",
    address: event.srcAddress.toLowerCase(),
    chain: BigInt(event.chainId),
    collection_id: collectionId,
    createdAt: BigInt(event.block.timestamp),
    createdBlock: BigInt(event.block.number),
    entitytype: "ActivityTransfer",
    from_id: fromUserChainInfoId,
    id: transferId,
    model: collentity?.symbol,
    to_id: toUserChainInfoId,
    token_id: tokenId,
    transactionindex: event.transaction.transactionIndex,
    txhash: event.transaction.hash,
    logIndex: event.logIndex
  }
  context.Transfer.set(transfer)


  // update the token if exist 
  let token = await context.Token.get(tokenId)
  if (token === undefined) {
    let tokenObject: Token = {
        address: event.srcAddress.toLowerCase(),
        burnblocknumber: undefined,
        burnblocktimestamp: undefined,
        burntxhash: undefined,
        chain: BigInt(event.chainId),
        collection_id: collectionId,
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        creator_id: toUserChainInfoId,
        id: tokenId,
        metadatacontent: undefined,
        metadatauri: undefined,
        mintblocknumber: event.block.number,
        mintblocktimestamp: event.block.timestamp,
        minttxhash: event.transaction.hash,
        model: collentity?.symbol,
        nsfw: false,
        owner_id: toUserChainInfoId,
        parent_id: undefined,
        remixer_id: undefined,
        standard: "ERC721",
        updatedAt: BigInt(event.block.timestamp),
        updatedBlock: BigInt(event.block.number),
        marketplace_id: "",
        error: undefined,
        microTokenEnables: undefined,
        remixEnabled: undefined
    }

    context.Token.set(tokenObject)

  } else {
    const updatedToken = {
      ...token,
      owner_id: toUserChainInfoId,
      updatedAt: BigInt(event.block.timestamp),
      updatedBlock: BigInt(event.block.number)
    }

    context.Token.set(updatedToken)
  }

})

