const { describe, it } = require("node:test");

const {
    Contract,
    ContractFactory,
    JsonRpcProvider,
    MaxUint256,
    Provider,
    Wallet } = require("ethers");

const { execSync } = require("node:child_process");

const TestERC20 = require("../out/TestERC20.sol/TestERC20.json");
const Factory = require("../out/INineLivesFactory.sol/INineLivesFactory.json");
const Trading = require("../out/INineLivesTrading.sol/INineLivesTrading.json");
const assert = require("node:assert");

function generateId({ name, desc }) {
    const res =
        execSync(
            `go run scripts/outcome/generate-id.go ${name} ${desc} ${(Math.random() * 300).toFixed(0)}`,
            {
                stdio: ["ignore", "pipe", "ignore"]
            },
        ).toString().trim();
    const id = res.split(',').pop()
    return id
}
function getIds(items) {
    return items.map(({ name, desc }) => generateId({ name, desc }))
}

describe("Mint test", async () => {
    const RPC_URL = process.env.SPN_SUPERPOSITION_URL;
    const DEPLOY_KEY = process.env.SPN_SUPERPOSITION_KEY;

    if (!RPC_URL) throw new Error("SPN_SUPERPOSITION_URL unset");
    if (!DEPLOY_KEY) throw new Error("SPN_SUPERPOSITION_KEY unset");

    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(DEPLOY_KEY, provider);
    const outcomeDetails = [{ name: "cat", desc: "animal" }, { name: "dog", desc: "animal" }]
    const factoryAddress = "0xd6f788544a1F2046183716A99E81Ec93685903f5"
    const fusdcAddress = "0xa8ea92c819463efbeddfb670fefc881a480f0115"
    const receiver = "0x63177184B8b5e1229204067a76Ec4c635009CBD2"
    const onefUSD = 1000000
    const factoryContract = new Contract(factoryAddress, Factory.abi, signer);
    const fusdc = new Contract(fusdcAddress, TestERC20.abi, signer);

    const outcomeIds = getIds(outcomeDetails)
    const outcomeInput = outcomeIds.map((id) => ({ identifier: id, amount: onefUSD })) // seed >= 1e6
    let tradingAddress = null;
    let tradingContract = null;
    let shareContract = null;
    it("generated id should have a length of 18 as 8byte id", () => {
        outcomeIds.forEach(id => {
            assert.equal(id.length, 18)
        });
        console.log("outcomeIds", outcomeIds)
    })
    it("should approve FUSDC spending for the factory", async () => {
        const response = await (await fusdc.approve(factoryAddress, MaxUint256)).wait();
        assert.equal(response.status, 1)
    })
    it("should get the new trading contract address", async () => {
        tradingAddress = await factoryContract.newTrading.staticCall(outcomeInput);
        console.log("tradingAddr", tradingAddress)
        tradingContract = new Contract(tradingAddress, Trading.abi, signer);
        assert.ok(Boolean(tradingAddress))
    })
    it("should create a new trading contract", async () => {
        const response = await (await factoryContract.newTrading(outcomeInput)).wait();
        assert.ok(response.status)
    })
    it("should approve FUSDC spending for the trading contract", async () => {
        const response = await (await fusdc.approve(tradingAddress, MaxUint256)).wait();
        assert.ok(response.status)
    })
    it("should get the share contract address", async () => {
        const shareAddr = await tradingContract.shareAddr(outcomeIds[0]);
        console.log("shareAddr", shareAddr)
        shareContract = new Contract(shareAddr, TestERC20.abi, signer);
        assert.equal(shareAddr.length, 42)
    })
    it("should mint a share", async () => {
        const response = await (await tradingContract.mintE12943CE(outcomeIds[0], onefUSD, receiver)).wait();
        assert.ok(response.status)
    })
})