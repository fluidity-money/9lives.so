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

    if (!RPC_URL) throw new Error("SPN_SUPERPOSITION_URL unset");
    if (!DEPLOY_KEY) throw new Error("SPN_SUPERPOSITION_KEY unset");
    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(DEPLOY_KEY, provider);

    const factory = new Contract("0x8D3cD4D05DCeb276c6f33AAdC45141BFCB58BAC8", Factory.abi, signer);

    // you can change outcomes here to test and deploy new trading contracts
    const outcome1 = "0x849179e252117c17"; // Trump keccak256(n,d,s)
    const outcome2 = "0x509007fee9be87e4"; // Kamala

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
        const tx = await factory.newTrading(outcomes);
        const receipt = await tx.wait();

        assert(receipt);
    })
})

