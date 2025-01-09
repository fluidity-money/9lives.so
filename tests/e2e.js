const {describe, it} = require("node:test");
const assert = require("assert");

const {
  Contract,
  ContractFactory,
  JsonRpcProvider,
  MaxUint256,
  Provider,
  Wallet,
  encodeBytes32String, } = require("ethers");

const {execSync} = require("node:child_process");

const TestERC20 = require("../out/TestERC20.sol/TestERC20.json");
const MockLongtail = require("../out/MockLongtail.sol/MockLongtail.json");
const Factory = require("../out/INineLivesFactory.sol/INineLivesFactory.json");
const Trading = require("../out/INineLivesTrading.sol/INineLivesTrading.json");
const LensesV1 = require("../out/LensesV1.sol/LensesV1.json");
const HelperFactory = require("../out/HelperFactory.sol/HelperFactory.json");
const InfraMarket = require("../out/IInfraMarket.sol/IInfraMarket.json");
const TestingProxy = require("../out/TestingProxy.sol/TestingProxy.json");

const MaxU64 = 18446744073709551615n;

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
        "SPN_EMERGENCY_COUNCIL": defaultAccountAddr,
        "SPN_SARP_AI": "0x0000000000000000000000000000000000000000",
        "SPN_DAO_ADDR": defaultAccountAddr,
        "SPN_ADJUST_TIME": "yes"
      },
      stdio: ["ignore", "pipe", "pipe"]
    },
  );

  const {
    lockupProxy: lockupProxyAddr,
    lockupProxyToken: lockupProxyTokenAddr,
    factoryProxy: factoryProxyAddr,
    optimisticInfraMarketImplementation: infraMarketImplAddr,
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

    const infraMarketTestingAddr = execSync(
    "./deploy.sh contract-infra-market-testing.wasm",
    {
      env: {
        "PATH": process.env.PATH,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY
      },
      stdio: ["ignore", "pipe", "pipe"]
    },
  );

  const TestingProxyFactory = new ContractFactory(
    TestingProxy.abi,
    TestingProxy.bytecode,
    signer
  );

  const infraMarketProxy = await TestingProxyFactory.deploy(
    infraMarketImplAddr,
    infraMarketTestingAddr
  );

  await infraMarketProxy.waitForDeployment();

  const infraMarketAddr = await infraMarketProxy.getAddress();

  const infraMarket = new Contract(infraMarketAddr, InfraMarket.abi, signer);

  const helperFactoryFactory = new ContractFactory(
    HelperFactory.abi,
    HelperFactory.bytecode,
    signer
  );

  const helperFactoryDeploy = await helperFactoryFactory.deploy(
    fusdcAddress,
    factoryProxyAddr,
    infraMarketProxyAddr,
    "0x0000000000000000000000000000000000000000", // TODO (beauty contest)
    "0x0000000000000000000000000000000000000000" // We don't test SARP AI here.
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

  const tradingAddr = await helperFactory.createWithCustom.staticCall(
      defaultAccountAddr, // Custom oracle
      outcomes,
      MaxU64, // Time end
      documentationHash,
      defaultAccountAddr, // Fee recipient
  );
  await (await helperFactory.createWithCustom(
      defaultAccountAddr, // Custom oracle
      outcomes,
      MaxU64, // Time end
      documentationHash,
      defaultAccountAddr, // Fee recipient
  )).wait();

  const trading = new Contract(tradingAddr, Trading.abi, signer);

  const share1Addr = await trading.shareAddr(outcome1);
  const share1 = new Contract(share1Addr, TestERC20.abi, signer);

  await (await fusdc.approve(tradingAddr, MaxUint256)).wait();

  it("Should support minting shares, then activating payoff, and receiving all of the pool.", async () => {
    const balBefore = await share1.balanceOf(defaultAccountAddr);
    await (await trading.mintPermitE90275AB(
      outcome1,
      6 * 1e6,
      defaultAccountAddr,
      0,
      0,
      encodeBytes32String(""),
      encodeBytes32String("")
    )).wait();
    assert.equal(await share1.balanceOf(defaultAccountAddr), "4181648");
    await (await trading.mintPermitE90275AB(
      outcome1,
      9 * 1e6,
      defaultAccountAddr,
      0,
      0,
      encodeBytes32String(""),
      encodeBytes32String("")
    )).wait();
    const balAfter = 5841324 + 4181648;
    assert.equal(await share1.balanceOf(defaultAccountAddr), balAfter);
    await (await trading.decide(outcome1)).wait();
    const fusdcBalBefore = await fusdc.balanceOf(defaultAccountAddr);
    await (await trading.payoff91FA8C2E(outcome1, balAfter, defaultAccountAddr)).wait();
    assert.equal(await share1.balanceOf(defaultAccountAddr), "0");
    assert.ok(await fusdc.balanceOf(defaultAccountAddr) > fusdcBalBefore);
  });
});
