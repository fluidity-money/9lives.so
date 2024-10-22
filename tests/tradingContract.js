const assert = require("node:assert")
const { describe, it } = require("node:test");

const {
    Contract,
    JsonRpcProvider,
    Wallet } = require("ethers");
const Factory = require("../out/INineLivesFactory.sol/INineLivesFactory.json");

describe("Read trading contract address", async () => {
    const RPC_URL = process.env.SPN_SUPERPOSITION_URL;
    const DEPLOY_KEY = process.env.SPN_SUPERPOSITION_KEY;
    const FACTORY = process.env.SPN_FACTORY_ADDR

    if (!RPC_URL) throw new Error("SPN_SUPERPOSITION_URL unset");
    if (!DEPLOY_KEY) throw new Error("SPN_SUPERPOSITION_KEY unset");
    if (!FACTORY) throw new Error("SPN_FACTORY_ADDR unset");
    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(DEPLOY_KEY, provider);

    const factory = new Contract(FACTORY, Factory.abi, signer);
    // trdAddr 0x8248aC70745141F484709C73E642c530ef1a0b00
    // you can change outcomes here to test and deploy new trading contracts
    const outcome1 = "0x9e79ed8f3f957e4b"; // Ryu,Fighter,947,0x9e79ed8f3f957e4b
    const outcome2 = "0x257e43cceaa2a5ac"; // Ken,Fighter,665,0x257e43cceaa2a5ac

    const outcomes = [
        {
            identifier: outcome1,
            amount: 1000000 // value >= 1e6
        },
        {
            identifier: outcome2,
            amount: 1000000 // value >= 1e6
        },
    ];
    const tradingAddr = await factory.newTrading.staticCall(outcomes);
    it("should return an address", () => {
        console.log("trading address", tradingAddr);
        assert(tradingAddr)
    })

    it('should deploy it', async () => {
        const tx = await factory.newTradingC11AAA3B(outcomes);
        const receipt = await tx.wait();

        assert(receipt);
    })
})

