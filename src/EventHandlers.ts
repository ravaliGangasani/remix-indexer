/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import "./EventHandlers.Transfer"
import {
  Factory,
  Factory_BeaconUpdated,
  Factory_OwnershipTransferred,
  ImplementationContract,
  Approval,
  ApprovalForAll,
  BatchMetadataUpdate,
  Initialized,
  MetadataUpdate,
  OwnershipTransferred,
  Collection,
  Unpaused,
  Paused,
  ContractURI,
} from "generated";
import { TryFetchIpfsFile } from "./utils/fetchIPFS";

Factory.BeaconUpdated.handler(async ({ event, context }) => {
  const entity: Factory_BeaconUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    beaconType: event.params.beaconType,
    newBeacon: event.params.newBeacon,
  };

  context.Factory_BeaconUpdated.set(entity);
});



Factory.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: Factory_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    previousOwner: event.params.previousOwner,
    newOwner: event.params.newOwner,
  };

  context.Factory_OwnershipTransferred.set(entity);
});


ImplementationContract.Approval.handler(async ({ event, context }) => {
  let tokenId = `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.params.tokenId}`
    let entity: Approval = {
        id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
        address: event.srcAddress.toLowerCase(),
        approved: event.params.approved,
        chain: BigInt(event.chainId),
        owner: event.params.owner.toLowerCase(),
        token_id: tokenId,
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        transactionindex: event.transaction.transactionIndex,
        txhash: event.transaction.hash
    }

    context.Approval.set(entity)
});

ImplementationContract.ApprovalForAll.handler(async ({ event, context }) => {
  let entity: ApprovalForAll = {
    id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
    address: event.srcAddress.toLowerCase(),
    approved: event.params.approved,
    chain: BigInt(event.chainId),
    createdAt: BigInt(event.block.timestamp),
    createdBlock: BigInt(event.block.number),
    operator: event.params.operator.toLowerCase(),
    owner: event.params.owner.toLowerCase(),
    transactionindex: event.transaction.transactionIndex,
    txhash: event.transaction.hash
}

context.ApprovalForAll.set(entity)
});

ImplementationContract.BatchMetadataUpdate.handler(async ({ event, context }) => {
  let entity: BatchMetadataUpdate = {
    id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
    address: event.srcAddress.toLowerCase(),
    chain: BigInt(event.chainId),
    createdAt: BigInt(event.block.timestamp),
    createdBlock: BigInt(event.block.number),
    fromTokenId: event.params._fromTokenId,
    toTokenId: event.params._toTokenId,
    transactionindex: event.transaction.transactionIndex,
    txhash: event.transaction.hash
}

context.BatchMetadataUpdate.set(entity)
});



ImplementationContract.Initialized.handler(async ({ event, context }) => {
  let entity: Initialized = {
    id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
    address: event.srcAddress.toLowerCase(),
    chain: BigInt(event.chainId),
    createdAt: BigInt(event.block.timestamp),
    createdBlock: BigInt(event.block.number),
    transactionindex: event.transaction.transactionIndex,
    txhash: event.transaction.hash,
    version: event.params.version
}

context.Initialized.set(entity)
});

ImplementationContract.MetadataUpdate.handler(async ({ event, context }) => {
  let entity: MetadataUpdate = {
    id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
    address: event.srcAddress.toLowerCase(),
    chain: BigInt(event.chainId),
    createdAt: BigInt(event.block.timestamp),
    createdBlock: BigInt(event.block.number),
    token_id: event.params._tokenId.toString(),
    transactionindex: event.transaction.transactionIndex,
    txhash: event.transaction.hash
}

context.MetadataUpdate.set(entity)
});

ImplementationContract.OwnershipTransferred.handler(async ({ event, context }) => {
  let entity: OwnershipTransferred = {
    id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
    address: event.srcAddress.toLowerCase(),
    chain: BigInt(event.chainId),
    createdAt: BigInt(event.block.timestamp),
    createdBlock: BigInt(event.block.number),
    newOwner: event.params.newOwner.toLowerCase(),
    previousOwner: event.params.previousOwner.toLowerCase(),
    transactionindex: event.transaction.transactionIndex,
    txhash: event.transaction.hash

}

context.OwnershipTransferred.set(entity)
});

ImplementationContract.Paused.handler(async ({ event, context }) => {
  let collectionId = `${event.chainId}:${event.srcAddress.toLowerCase()}`
    let entity: Paused = {
        id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
        address: event.srcAddress.toLowerCase(),
        chain: BigInt(event.chainId),
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        account: event.params.account.toLowerCase(),
        transactionindex: event.transaction.transactionIndex,
        txhash: event.transaction.hash,
        collection_id: `${event.chainId}:${event.srcAddress.toLowerCase()}`
    }
    context.Paused.set(entity)


    // Update Collection 
    let collectionEntity = await context.Collection.get(collectionId)
    if (collectionEntity === undefined) {
        let collectionObject: Collection = {
            address: event.srcAddress.toLowerCase(),
            chain: BigInt(event.chainId),
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            creator_id: undefined,
            factory_id: undefined,
            id: collectionId,
            isFeatured: undefined,
            isPaused: undefined,
            maxSupply: undefined,
            metadatacontent: undefined,
            metadatauri: undefined,
            name: undefined,
            owner_id: undefined,
            symbol: undefined,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
            error: "error while finding collection",
            baseCollectionId:"",
            baseTokenId:"",
            collectionType:"COLLECTION"
        }

        context.Collection.set(collectionObject)

    } else {
        let collectionObject = {
            ...collectionEntity,
            isPaused: true,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }
        context.Collection.set(collectionObject)

    }
});


ImplementationContract.Unpaused.handler(async ({ event, context }) => {
  let collectionId = `${event.chainId}:${event.srcAddress.toLowerCase()}`

    let entity: Unpaused = {
        id: `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`,
        address: event.srcAddress.toLowerCase(),
        chain: BigInt(event.chainId),
        createdAt: BigInt(event.block.timestamp),
        createdBlock: BigInt(event.block.number),
        transactionindex: event.transaction.transactionIndex,
        txhash: event.transaction.hash,
        collection_id: collectionId
    }

    context.Unpaused.set(entity)

    // Update collection
    let collectionEntity = await context.Collection.get(collectionId)
    if (collectionEntity === undefined) {
        let collectionObject: Collection = {
            address: event.srcAddress.toLowerCase(),
            chain: BigInt(event.chainId),
            createdAt: BigInt(event.block.timestamp),
            createdBlock: BigInt(event.block.number),
            creator_id: undefined,
            factory_id: undefined,
            id: collectionId,
            isFeatured: undefined,
            isPaused: undefined,
            maxSupply: undefined,
            metadatacontent: undefined,
            metadatauri: undefined,
            name: undefined,
            owner_id: undefined,
            symbol: undefined,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number),
            error: "error while finding collection",
            baseCollectionId:"",
            baseTokenId:"",
            collectionType:"COLLECTION"
        }

        context.Collection.set(collectionObject)

    } else {
        let collectionObject = {
            ...collectionEntity,
            isPaused: false,
            updatedAt: BigInt(event.block.timestamp),
            updatedBlock: BigInt(event.block.number)
        }
        context.Collection.set(collectionObject)

    }
});


ImplementationContract.ContractURISet.handler(async ({ event, context }) => {
  let collectionId = `${event.chainId}:${event.srcAddress.toLowerCase()}`

  let contracturiID = `${event.chainId}:${event.srcAddress.toLowerCase()}:${event.transaction.hash}`

  let entity: ContractURI = {
      id: contracturiID,
      address: event.srcAddress.toLowerCase(),
      chain: BigInt(event.chainId),
      createdAt: BigInt(event.block.timestamp),
      createdBlock: BigInt(event.block.number),
      transactionindex: event.transaction.transactionIndex,
      txhash: event.transaction.hash,
      uri: event.params.uri,
      
  }
  context.ContractURI.set(entity)

  // Update collection
  let collectionEntity = await context.Collection.get(collectionId)
  if (collectionEntity === undefined) {
      let collectionObject: Collection = {
          address: event.srcAddress.toLowerCase(),
          chain: BigInt(event.chainId),
          createdAt: BigInt(event.block.timestamp),
          createdBlock: BigInt(event.block.number),
          creator_id: undefined,
          factory_id: undefined,
          id: collectionId,
          isFeatured: undefined,
          isPaused: undefined,
          maxSupply: undefined,
          metadatacontent: undefined,
          metadatauri: undefined,
          name: undefined,
          owner_id: undefined,
          symbol: undefined,
          updatedAt: BigInt(event.block.timestamp),
          updatedBlock: BigInt(event.block.number),
          error: "error while finding collection",
          baseCollectionId:"",
          baseTokenId:"",
          collectionType: "COLLECTION"
      }

      context.Collection.set(collectionObject)

  } else {

      let collectionMetadata = await TryFetchIpfsFile(event.params.uri)


      let collectionObject = {
          ...collectionEntity,
          metadatacontent: JSON.stringify(collectionMetadata),
          metadatauri: event.params.uri,
          updatedAt: BigInt(event.block.timestamp),
          updatedBlock: BigInt(event.block.number)
      }
      context.Collection.set(collectionObject)

  }
})
