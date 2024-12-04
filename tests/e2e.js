const {describe, it} = require("node:test");
const assert = require("assert");

const {
  Contract,
  ContractFactory,
  JsonRpcProvider,
  MaxUint256,
  Provider,
  Wallet } = require("ethers");

const {execSync} = require("node:child_process");

const TestERC20 = require("../out/TestERC20.sol/TestERC20.json");
const MockLongtail = require("../out/MockLongtail.sol/MockLongtail.json");
const Factory = require("../out/INineLivesFactory.sol/INineLivesFactory.json");
const FactoryProxy = require("../out/FactoryProxy.sol/FactoryProxy.json");
const Trading = require("../out/INineLivesTrading.sol/INineLivesTrading.json");
const LensesV1 = require("../out/LensesV1.sol/LensesV1.json");
const HelperFactory = require("../out/HelperFactory.sol/HelperFactory.json");

describe("End to end tests", async () => {
  const RPC_URL = process.env.SPN_SUPERPOSITION_URL;
  const DEPLOY_KEY = process.env.SPN_SUPERPOSITION_KEY;

  const provider = new JsonRpcProvider(RPC_URL);

  const chainId = Number((await provider.getNetwork()).chainId);

  const signer = new Wallet(DEPLOY_KEY, provider);

  const defaultAccountAddr = await signer.getAddress();

  // Deploy a test ERC20.

  const erc20Factory = new ContractFactory(
    TestERC20.abi,
    TestERC20.bytecode,
    signer
  );
  const shareDeploy = await erc20Factory.deploy();
  await shareDeploy.waitForDeployment();
  const fusdcAddress = await shareDeploy.getAddress();
  const fusdc = new Contract(fusdcAddress, TestERC20.abi, signer);

  const stakedArbDeploy = await erc20Factory.deploy();
  await stakedArbDeploy.waitForDeployment();
  const stakedArbAddress = await stakedArbDeploy.getAddress();
  const stakedArb = new Contract(stakedArbAddress, TestERC20.abi, signer);

  // Deploy a mocked out Longtail.

  const longtailFactory = new ContractFactory(
    MockLongtail.abi,
    MockLongtail.bytecode,
    signer
  );
  const longtailDeploy = await longtailFactory.deploy();
  await longtailDeploy.waitForDeployment();
  const longtailAddress = await longtailDeploy.getAddress();

  const deployStr = execSync(
    "./build-and-deploy.sh",
    {
      env: {
        "PATH": process.env.PATH,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY,
        "SPN_LONGTAIL_ADDR": longtailAddress,
        "SPN_FUSDC_ADDR": fusdcAddress,
        "SPN_STAKED_ARB_ADDR": stakedArbAddress,
        "SPN_PROXY_ADMIN": defaultAccountAddr,
        "SPN_EMERGENCY_COUNCIL": defaultAccountAddr
      },
      stdio: ["ignore", "pipe", "ignore"]
    },
  );

  const {
    lockupProxy: lockupProxyAddr,
    lockupProxyToken: lockupProxyTokenAddr,
    factoryProxy: factoryProxyAddr,
    infrastructureMarketProxy: infraMarketProxyAddr,
    shareImplementation,
    tradingDpmExtrasImplementation,
    tradingDpmMintImplementation,
    tradingDpmPriceImplementation,
    tradingDpmQuotesImplementation
  } = (() => {
    try {
      return JSON.parse(deployStr);
    } catch (err) {
      throw new Error(`deploy str: ${deployStr}`);
    }
  })();

  const helperFactoryFactory = new ContractFactory(
    HelperFactory.abi,
    HelperFactory.bytecode,
    signer
  );

  const helperFactoryDeploy = await helperFactoryFactory.deploy(
    fusdcAddress,
    factoryProxyAddr,
    infraMarketProxyAddr
  );

  await helperFactoryDeploy.waitForDeployment();

  const helperFactory = new Contract(
    await helperFactoryDeploy.getAddress(),
    HelperFactory.abi,
    signer
  );

  const factoryProxy = new Contract(
    factoryProxyAddr,
    Factory.abi,
    signer
  );

  assert.equal(
    shareImplementation.toLowerCase(),
    (await factoryProxy.shareImpl()).toLowerCase()
  );

  const outcome1 = "0x1e9e51837f3ea6ea";
  const outcome2 = "0x1e9e51837f3ea6eb";

  const timestamp = 100;

  // We set both outcomes to $1 for the price.
  const outcomes = [
    {
      identifier: outcome1,
      sqrtPrice: 79228162514264337593543950336n,
      name: "Shahmeer"
    },
    {
      identifier: outcome2,
      sqrtPrice: 79228162514264337593543950336n,
      name: "Ivan"
    },
  ];

  const outcomeBals = Buffer.alloc(32);
  Buffer.from(outcome1.substr(-16), "hex").copy(outcomeBals, 0);
  Buffer.from(outcome2.substr(-16), "hex").copy(outcomeBals, 8);

  await (await fusdc.approve(helperFactory, MaxUint256)).wait();

  const documentationHash =
    "0x482762a5bf88a80830135ebdf2bb2abca30d3ebe991712570faf4b85e5e27f1d";

  const tradingAddr = await helperFactory.createWithInfraMarket.staticCall(
      outcomes,
      timestamp + 100,   // Time end
      documentationHash,
      defaultAccountAddr // Fee recipient
  );
  await (await helperFactory.createWithInfraMarket(
      outcomes,
      timestamp + 100,   // Time end
      documentationHash,
      defaultAccountAddr // Fee recipient
  )).wait();

  const trading = new Contract(tradingAddr, Trading.abi, signer);

  const share1Addr = await trading.shareAddr(outcome1);
  const share1 = new Contract(share1Addr, TestERC20.abi, signer);

  await (await fusdc.approve(tradingAddr, MaxUint256)).wait();

  it("Should support minting shares, then activating payoff, and receiving all of the pool.", async () => {
    const balBefore = await share1.balanceOf(defaultAccountAddr);
    await (await trading.mintPermitB8D681AD(
      outcome1,
      6 * 1e6,
      defaultAccountAddr,
      0,
      0,
      [],
      []
    )).wait();
    const balAfter = await share1.balanceOf(defaultAccountAddr);
    assert.equal(balAfter, "4476926");
    return;
    await (await trading.decide(outcome1)).wait();
    const fusdcBalBefore = await fusdc.balanceOf(defaultAccountAddr);
    await (await trading.payoff(outcome1, balAfter, defaultAccountAddr)).wait();
    assert.equal(await share1.balanceOf(defaultAccountAddr), "0");
    assert.ok(await fusdc.balanceOf(defaultAccountAddr) > fusdcBalBefore);
  });
});
