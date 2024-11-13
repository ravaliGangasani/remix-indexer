import assert from "assert";
import { 
  TestHelpers,
  Factory_BeaconUpdated
} from "generated";
const { MockDb, Factory } = TestHelpers;

describe("Factory contract BeaconUpdated event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for Factory contract BeaconUpdated event
  const event = Factory.BeaconUpdated.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("Factory_BeaconUpdated is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await Factory.BeaconUpdated.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualFactoryBeaconUpdated = mockDbUpdated.entities.Factory_BeaconUpdated.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedFactoryBeaconUpdated: Factory_BeaconUpdated = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      beaconType: event.params.beaconType,
      newBeacon: event.params.newBeacon,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualFactoryBeaconUpdated, expectedFactoryBeaconUpdated, "Actual FactoryBeaconUpdated should be the same as the expectedFactoryBeaconUpdated");
  });
});
