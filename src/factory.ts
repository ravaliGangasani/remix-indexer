import { factory, Factory_ClutchCollectionDeployed, User, updatedValue, UserChainInfo, Collection, factory_ClutchCollectionDeployed, Factory_RemixWithTokenCollectionDeployed, factory_RemixCollectionDeployed, Token } from './../generated/src/Types.gen';
import { Factory } from "generated/src/Handlers.gen";
import { formatToAddress } from './utils/stringformat';
import { getContractMetadata } from './utils/collectionMetadata';
import { TryFetchIpfsFile } from './utils/fetchIPFS';
import { ethers } from 'ethers';

Factory.ClutchCollectionDeployed.handler(async ({ event, context }) => {

    let contractSymbol: string | undefined
    let contractName: string | undefined
    let tokenMaxSupply: bigint | undefined
    let contractURI: string | undefined
    let collectionOwner: string | undefined

    let collectionId = `${event.chainId}:${event.params.proxy.toLowerCase()}`
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
    }


    // User 
    let creator = collectionOwner ? collectionOwner.toLowerCase() : ""
    let creatorObject = await context.User.get(creator)

    if (creatorObject === undefined) {
        let userEntity: User = {
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: creator,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }

        context.User.set(userEntity)
    } else {
        let userEntity = {
            ...creatorObject,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }
        context.User.set(userEntity)
    }

    let userChainInfoId = `${event.chainId}:${creator}`
    let userChainInfo = await context.UserChainInfo.get(userChainInfoId)
    if (userChainInfo === undefined) {
        let userChainInfoObject: UserChainInfo = {
            address: creator,
            chain: BigInt(event.chainId),
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: userChainInfoId,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
            user_id: creator
        }

        context.UserChainInfo.set(userChainInfoObject)
    } else {
        let userChainInfoObject = {
            ...userChainInfo,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
        }
        context.UserChainInfo.set(userChainInfoObject)
    }


    // CollectionDeployed event
    let factoryId = `${event.chainId}:${event.srcAddress.toLowerCase()}`

    let entity: factory_ClutchCollectionDeployed = {
        address: event.srcAddress.toLowerCase(),
        chain: BigInt(event.chainId),
        collection_id: collectionId,
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        data: event.params.data,
        deployer_id: `${event.chainId}:${collectionOwner?.toLowerCase()}`,
        factory_id: factoryId,
        id: `${event.chainId}:${event.srcAddress.toLowerCase()}`,
        proxy: event.params.proxy.toLowerCase(),
        transactionindex: event.transaction.transactionIndex,
        txhash: event.transaction.hash
    }

    context.Factory_ClutchCollectionDeployed.set(entity)


    // Data Decoding 

    // ABI for the ClutchCollection.initialize function
    const initializeABI = [
        "function initialize(address owner, string name, string symbol, string baseURI, string contractURI)"
    ];

    // Interface to decode the initialization data
    const clutchIface = new ethers.Interface(initializeABI);

    // Decode the initialization data
    const decodedInitData = clutchIface.decodeFunctionData("initialize", event.params.data);

    let collectionMetadata = (await TryFetchIpfsFile(decodedInitData.contractURI)) as any

    // Collection Save
    let collectionObject: Collection = {
        address: event.params.proxy.toLowerCase(),
        chain: BigInt(event.chainId),
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        creator_id: `${event.chainId}:${decodedInitData.owner.toLowerCase()}`,
        factory_id: factoryId,
        id: collectionId,
        isFeatured: false,
        isPaused: false,
        maxSupply: tokenMaxSupply,
        metadatacontent: JSON.stringify(collectionMetadata),
        metadatauri: decodedInitData.contractURI,
        name: decodedInitData.name,
        owner_id: `${event.chainId}:${decodedInitData.owner.toLowerCase()}`,
        symbol: decodedInitData.symbol,
        updatedAt: BigInt(event.block.timestamp),
        updatedBlock: BigInt(event.block.number),
        error: undefined,
        baseCollectionId: "",
        baseTokenId: "",
        collectionType: "COLLECTION"
    }

    context.Collection.set(collectionObject)

    //owner
    let owner = decodedInitData.owner.toLowerCase()
    let ownerObject = await context.User.get(owner)

    if (ownerObject === undefined) {
        let userEntity: User = {
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: owner,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }

        context.User.set(userEntity)
    } else {
        let userEntity = {
            ...ownerObject,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }
        context.User.set(userEntity)
    }

    let ownerChainInfoId = `${event.chainId}:${owner}`
    let ownerChainInfo = await context.UserChainInfo.get(ownerChainInfoId)
    if (ownerChainInfo === undefined) {
        let userChainInfoObject: UserChainInfo = {
            address: owner,
            chain: BigInt(event.chainId),
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: ownerChainInfoId,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
            user_id: owner
        }

        context.UserChainInfo.set(userChainInfoObject)
    } else {
        let userChainInfoObject = {
            ...ownerChainInfo,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
        }
        context.UserChainInfo.set(userChainInfoObject)
    }
});


Factory.RemixCollectionDeployed.handler(async ({ event, context }) => {

    const initializeABI = [
        "function initialize(address owner,address admin, string name, string symbol, string baseURI, string contractURI,address baseNFTAddress,uint256 baseTokenId, address feeHandler)"
    ];

    let contractSymbol: string | undefined
    let contractName: string | undefined
    let tokenMaxSupply: bigint | undefined
    let contractURI: string | undefined
    let collectionOwner: string | undefined

    let collectionId = `${event.chainId}:${event.params.proxy.toLowerCase()}`
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
    }


    // User 
    let userAddress = collectionOwner ? collectionOwner.toLowerCase() : ""
    let userObject = await context.User.get(userAddress)

    if (userObject === undefined) {
        let userEntity: User = {
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: userAddress,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }

        context.User.set(userEntity)
    } else {
        let userEntity = {
            ...userObject,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }
        context.User.set(userEntity)
    }

    let userChainInfoId = `${event.chainId}:${userAddress}`
    let userChainInfo = await context.UserChainInfo.get(userChainInfoId)
    if (userChainInfo === undefined) {
        let userChainInfoObject: UserChainInfo = {
            address: userAddress,
            chain: BigInt(event.chainId),
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: userChainInfoId,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
            user_id: userAddress
        }

        context.UserChainInfo.set(userChainInfoObject)
    } else {
        let userChainInfoObject = {
            ...userChainInfo,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
        }
        context.UserChainInfo.set(userChainInfoObject)
    }


    // CollectionDeployed event
    let factoryId = `${event.chainId}:${event.srcAddress.toLowerCase()}`

    let entity: factory_RemixCollectionDeployed = {
        address: event.srcAddress.toLowerCase(),
        chain: BigInt(event.chainId),
        collection_id: collectionId,
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        data: event.params.data,
        deployer_id: `${event.chainId}:${collectionOwner?.toLowerCase()}`,
        factory_id: factoryId,
        id: `${event.chainId}:${event.srcAddress.toLowerCase()}`,
        proxy: event.params.proxy.toLowerCase(),
        transactionindex: event.transaction.transactionIndex,
        txhash: event.transaction.hash
    }

    context.Factory_RemixCollectionDeployed.set(entity)


    // Data Decoding 

    // ABI for the ClutchCollection.initialize function
    // Interface to decode the initialization data
    const clutchIface = new ethers.Interface(initializeABI);

    // Decode the initialization data
    const decodedInitData = clutchIface.decodeFunctionData("initialize", event.params.data);

    let collectionMetadata = (await TryFetchIpfsFile(decodedInitData.contractURI)) as any
    let baseCollectionId = decodedInitData.baseNFTAddress.toLowerCase()
    let tokenId = `${event.chainId}:${baseCollectionId}:${decodedInitData.baseTokenId.toString()}`

    // Collection Save
    let collectionObject: Collection = {
        address: event.params.proxy.toLowerCase(),
        chain: BigInt(event.chainId),
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        creator_id: `${event.chainId}:${decodedInitData.owner.toLowerCase()}`,
        factory_id: factoryId,
        id: collectionId,
        isFeatured: false,
        isPaused: false,
        maxSupply: tokenMaxSupply,
        metadatacontent: JSON.stringify(collectionMetadata),
        metadatauri: decodedInitData.contractURI,
        name: decodedInitData.name,
        owner_id: `${event.chainId}:${decodedInitData.owner.toLowerCase()}`,
        symbol: decodedInitData.symbol,
        updatedAt: BigInt(event.block.timestamp),
        updatedBlock: BigInt(event.block.number),
        error: undefined,
        baseCollectionId: baseCollectionId,
        baseTokenId: tokenId,
        collectionType: "REMIX"
    }

    context.Collection.set(collectionObject)

    let owner = decodedInitData.owner.toLowerCase()
    let ownerObject = await context.User.get(owner)

    if (ownerObject === undefined) {
        let userEntity: User = {
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: owner,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }

        context.User.set(userEntity)
    } else {
        let userEntity = {
            ...ownerObject,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }
        context.User.set(userEntity)
    }

    let ownerChainInfoId = `${event.chainId}:${owner}`
    let ownerChainInfo = await context.UserChainInfo.get(ownerChainInfoId)
    if (ownerChainInfo === undefined) {
        let userChainInfoObject: UserChainInfo = {
            address: owner,
            chain: BigInt(event.chainId),
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            id: ownerChainInfoId,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
            user_id: owner
        }

        context.UserChainInfo.set(userChainInfoObject)
    } else {
        let userChainInfoObject = {
            ...ownerChainInfo,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
        }
        context.UserChainInfo.set(userChainInfoObject)
    }

    console.log(await context.Token.get(tokenId))
    
});

Factory.ClutchCollectionDeployed.contractRegister(async ({ event, context }) => {
    context.addImplementationContract(event.params.proxy)
})


