const {describe, it} = require("node:test");
const assert = require("assert");

const {
  Contract,
  ContractFactory,
  JsonRpcProvider,
  MaxUint256,
  Provider,
  toUtf8Bytes,
  Wallet,
  encodeBytes32String,
  keccak256 } = require("ethers");

const {execSync} = require("node:child_process");

const TestERC20 = require("../out/TestERC20.sol/TestERC20.json");
const MockLongtail = require("../out/MockLongtail.sol/MockLongtail.json");
const Factory = require("../out/INineLivesFactory.sol/INineLivesFactory.json");
const Trading = require("../out/INineLivesTrading.sol/INineLivesTrading.json");
const LensesV1 = require("../out/LensesV1.sol/LensesV1.json");
const HelperFactory = require("../out/HelperFactory.sol/HelperFactory.json");
const InfraMarket = require("../out/IInfraMarket.sol/IInfraMarket.json");
const TestingProxy = require("../out/TestingProxy.sol/TestingProxy.json");
const Lockup = require("../out/ILockup.sol/ILockup.json");
const MockTrading = require("../out/MockTrading.sol/MockTrading.json");
const InfraMarketHelper = require("../out/InfraMarketHelper.sol/InfraMarketHelper.json");
const WhingeHelper = require("../out/WhingeHelper.sol/WhingeHelper.json");
const TestPredictor = require("../out/TestPredictor.sol/TestPredictor.json");

const MaxU64 = 18446744073709551615n;
const ZeroAddress = "0x0000000000000000000000000000000000000000";

const MockInfraMarketDesc = "0x199c5aae6c811d3ac01629ab086452a4b306754d68eb3d79e28da2cc4ffa0eca";

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
    factoryProxy: factoryProxyAddr,
    optimisticInfraMarketImplementation: infraMarketImplAddr,
    tradingDpmExtrasImplementation,
    tradingDpmMintImplementation,
    tradingDpmPriceImplementation,
    tradingDpmQuotesImplementation,
    shareImplementation
  } = (() => {
    try {
      return JSON.parse(deployStr);
    } catch (err) {
      throw new Error(`deploy str: ${deployStr}`);
    }
  })();

  const lockup = new Contract(lockupProxyAddr, Lockup.abi, signer);

  const lockedArbToken = new Contract(
    await lockup.tokenAddr(),
    TestERC20.abi,
    signer
  );

  const lockedArbTokenAddr = await lockedArbToken.getAddress();

  await (await stakedArb.approve(lockupProxyAddr, MaxUint256)).wait();

  const infraMarketTestingAddr = execSync(
    "./deploy-stylus.sh contract-infra-market-testing.wasm",
    {
      env: {
        "PATH": process.env.PATH,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY
      },
      stdio: ["ignore", "pipe", "pipe"]
    },
  ).toString().trim();

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

  await (await lockup.updateInfraMarket(infraMarketAddr)).wait();

  const infraMarket = new Contract(infraMarketAddr, InfraMarket.abi, signer);

  await (await infraMarket.ctor(
    defaultAccountAddr, // Operator
    defaultAccountAddr, // Emergency council
    lockupProxyAddr,
    lockedArbTokenAddr,
    factoryProxyAddr
  )).wait();

  const InfraMarketHelperFactory = new ContractFactory(
    InfraMarketHelper.abi,
    InfraMarketHelper.bytecode,
    signer
  );

  const infraMarketHelper = await InfraMarketHelperFactory.deploy(
    fusdcAddress,
    infraMarketAddr
  );

  await infraMarketHelper.waitForDeployment();

  await (await fusdc.approve(infraMarketHelper.getAddress(), MaxUint256)).wait();
  await (await fusdc.approve(infraMarketAddr, MaxUint256)).wait();

  const helperFactoryFactory = new ContractFactory(
    HelperFactory.abi,
    HelperFactory.bytecode,
    signer
  );

  const helperFactoryDeploy = await helperFactoryFactory.deploy(
    fusdcAddress,
    factoryProxyAddr,
    infraMarketAddr,
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

  const MockTradingFactory = new ContractFactory(
    MockTrading.abi,
    MockTrading.bytecode,
    signer
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

  it("Should support simulating price calls", async () => {
    const tradingDpmPrice = new Contract(
      tradingDpmPriceImplementation,
      Trading.abi,
      signer
    );
    try {
        await tradingDpmPrice.priceA827ED27.staticCall(outcome1);
    } catch (err) {
        throw new Error(`price from trading price impl (${tradingDpmPriceImplementation}): ${err}`);
    }
    try {
        await trading.priceA827ED27.staticCall(outcome1);
    } catch (err) {
        throw new Error(`price from trading proxy: ${err}`);
    }
  });

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

  it(
    "Should support locking up some funds, creating an infra market, voting on each stage of the process",
    async () => {
      const lockupAmt = 10000n;
      const stakedArbBalBefore = await stakedArb.balanceOf(defaultAccountAddr);
      await (await lockup.lockup(lockupAmt, defaultAccountAddr)).wait();
      assert.equal(
        stakedArbBalBefore - lockupAmt,
        await stakedArb.balanceOf(defaultAccountAddr)
      );
      assert.equal(
        lockupAmt,
        await lockedArbToken.balanceOf(defaultAccountAddr)
      );
      assert.equal(0n, await lockup.lockedUntil(defaultAccountAddr));
      // Now that we've confirmed locking up works, we need to create a market.
      // We use this test contract to check its state once the decide function is called.
      const mockTrading = await MockTradingFactory.deploy(ZeroAddress, ZeroAddress);
      await mockTrading.waitForDeployment();
      const mockTradingAddr = await mockTrading.getAddress();
      // For our test user that makes a bad prediction, we're going to deploy a contract.
      const TestPredictorFactory = new ContractFactory(
          TestPredictor.abi,
          TestPredictor.bytecode,
          signer
      );
      // This predictor will eventually make a bigger investment than our user.
      // This will let us test that the slashing functionality is working.
      console.log("about to deploy the test predictor factory");
      const predictorAlex = await TestPredictorFactory.deploy(
        stakedArbAddress,
        lockupProxyAddr,
        infraMarketAddr
      );
      console.log("predictor factory deploy done");
      await predictorAlex.waitForDeployment();
      const predictorAlexAmt = 20000n;
      const predictorAlexAddr = await predictorAlex.getAddress();
      await (await stakedArb.approve(predictorAlexAddr, predictorAlexAmt)).wait();

      console.log("about to do lockup with predictor alex");
      await (await predictorAlex.lockup(predictorAlexAmt)).wait();
      console.log("done with predictor alex lockup");

      // Create the market using a helper to simplify things.
      await (await infraMarketHelper.register(
        mockTradingAddr,
        MockInfraMarketDesc,
        MaxU64
      )).wait();

      console.log("done registering");
      // Now that we've made the market, we can call it to begin the next step.
      // First, we must waste our time to advance the block timestamp.
      await (await infraMarketProxy.wasteOfTime()).wait();

      await (await infraMarket.call(
        mockTradingAddr,
        outcome1,
        defaultAccountAddr
      )).wait();

      const WhingeHelperFactory = new ContractFactory(
        WhingeHelper.abi,
        WhingeHelper.bytecode,
        signer
      );
      console.log("done using whinge approve");
      const whingeHelper = await WhingeHelperFactory.deploy();
      await whingeHelper.waitForDeployment();
      await (await fusdc.approve(
        await whingeHelper.getAddress(),
        MaxUint256
      )).wait();
      await (await whingeHelper.whinge(
        fusdcAddress,
        infraMarketAddr,
        mockTradingAddr,
        outcome2
      )).wait();
      // Now that whinging has taken place, we need to have the bettor make a prediction.
      const seed1 = 100;
      const predictionHash = keccak256(toUtf8Bytes(`${defaultAccountAddr}${outcome1}${seed1}`));
      console.log("about to do prediction!");
      await (await infraMarket.predict(mockTradingAddr, predictionHash)).wait();
      // We also need to make a prediction with a helper for making a bad prediction,
      // so we can test if slashing works with our default user here.
      console.log("about to do predict with predictoralex");
      await (await predictorAlex.predict(mockTradingAddr, outcome2)).wait();
      console.log("done doing predict with predictoralex");
      // Now that we've submitted our prediction, we need to wait two days and 1 second.
      await (await infraMarketProxy.addTime(2 * 60 * 60 * 24 + 1)).wait();
      console.log("about to reveal");
      // Now that we've waited, it's time for us to come up with reveals.
      await (await infraMarket.reveal(
        mockTradingAddr,
        defaultAccountAddr,
        outcome1,
        seed1
      )).wait();
      console.log("about to do lockup for more");
      // Let's have the default account lock up some more funds to see if partial slashing
      // is fine.
      await (await lockup.lockup(lockupAmtExcess, defaultAccountAddr)).wait();
      // This user is predicting more than the account sender.
      console.log("about to predictor alex reveal");
      await (await predictorAlex.reveal(
        mockTradingAddr,
        outcome2
      )).wait();
      // At this point, the voting power should be proportionate to what we invested.
      assert.equal(
        lockupAmt,
        await infraMarket.curOutcomeVestedArb(mockTradingAddr, outcome1)
      );
      assert.equal(
        predictorAlexAmt,
        await infraMarket.curOutcomeVestedArb(mockTradingAddr, outcome2)
      );
      // Now we need to advance time again by two days, then submit the outcomes,
      // and slash everyone.
      console.log("about to begin slashing");
      await (await infraMarketProxy.addTime(2 * 60 * 60 * 24)).wait();
      await (await infraMarket.declare(
        mockTradingAddr,
        [outcome1, outcome2],
        defaultAccountAddr
      )).wait();
      await (await infraMarket.sweep(
        mockTradingAddr,
        0,
        defaultAccountAddr,
        defaultAccountAddr
      )).wait();
      // Let's see if the lockup amount excess is fine.
      assert.equal(lockupAmtExcess, await lockedArbToken.balanceOf(defaultAccountAddr));
  });
});
