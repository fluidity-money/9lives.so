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

describe("End to end tests", async () => {
  const RPC_URL = process.env.SPN_SUPERPOSITION_URL;
  const DEPLOY_KEY = process.env.SPN_SUPERPOSITION_KEY;

  if (!RPC_URL) throw new Error("SPN_SUPERPOSITION_URL unset");
  if (!DEPLOY_KEY) throw new Error("SPN_SUPERPOSITION_KEY unset");

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
  const erc20Deploy = await erc20Factory.deploy();
  await erc20Deploy.waitForDeployment();
  const fusdcAddress = await erc20Deploy.getAddress();
  const fusdc = new Contract(fusdcAddress, TestERC20.abi, signer);

  // Deploy a mocked out Longtail.

  const longtailFactory = new ContractFactory(
    MockLongtail.abi,
    MockLongtail.bytecode,
    signer
  );
  const longtailDeploy = await longtailFactory.deploy();
  await longtailDeploy.waitForDeployment();
  const longtailAddress = await longtailDeploy.getAddress();

  // Build everything from a fresh state, get addresses first.

  const {
    factoryProxy: factoryProxyAddr,
    factory1Impl,
    factory2Impl,
    erc20Impl,
    tradingMintImpl,
    tradingExtrasImpl
  } =
    JSON.parse(execSync(
      `go run scripts/get-addresses-full-deploy.go ${defaultAccountAddr}`,
      {
        env: {
          ...process.env,
          "SPN_SUPERPOSITION_URL": RPC_URL,
        },
        stdio: ["ignore", "pipe", "ignore"]
      },
    ));

  // Do the actual building and deployment, pointing everything to the
  // factory implementation instead of the proxy.

  execSync(
    "./build-and-deploy.sh",
    {
      env: {
        ...process.env,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY,
        "SPN_LONGTAIL_ADDR": longtailAddress,
        "SPN_FUSDC_ADDR": fusdcAddress,
      },
      // stdio: ["ignore", "ignore", "ignore"]
    },
  );

  const factoryFactory = new ContractFactory(
    Factory.abi,
    Factory.bytecode,
    signer
  );

  const factoryProxyFactory  = new ContractFactory(
    FactoryProxy.abi,
    FactoryProxy.bytecode,
    signer
  );
  const factoryProxy_ = await factoryProxyFactory.deploy(
    defaultAccountAddr,
    factory1Impl,
    factory2Impl,
    factoryFactory.interface.encodeFunctionData("ctor", [
      defaultAccountAddr
    ])
  );
  await factoryProxy_.waitForDeployment();
  const factoryProxy = new Contract(
    await factoryProxy_.getAddress(),
    Factory.abi,
    signer
  );

  assert.equal(
    erc20Impl.toLowerCase(),
    (await factoryProxy.erc20Impl()).toLowerCase()
  );

  console.log(`fusdc addresss: ${fusdcAddress}`);

  const outcome1 = "0x1e9e51837f3ea6ea";
  const outcome2 = "0x1e9e51837f3ea6eb";

  const outcomes = [
    {
      identifier: outcome1,
      amount: 1000000
    },
    {
      identifier: outcome2,
      amount: 1000000
    },
  ];

  await (await fusdc.approve(factoryProxyAddr, MaxUint256)).wait();

  console.log("factoryProxyAddr:", factoryProxyAddr);

  const tradingAddr = await factoryProxy.newTradingC11AAA3B.staticCall(outcomes);
  const tx = await factoryProxy.newTradingC11AAA3B(outcomes);
  await tx.wait();

  const trading = new Contract(tradingAddr, Trading.abi, signer);

  const share1Addr = await trading.shareAddr(outcome1);
  const share1 = new Contract(share1Addr, TestERC20.abi, signer);

  await (await fusdc.approve(tradingAddr, MaxUint256)).wait();

  it("Should support minting shares", async () => {
    const balBefore = await share1.balanceOf(defaultAccountAddr);
    await trading.mint227CF432.staticCall(outcome1, 10000000, defaultAccountAddr);
    const balAfter = await share1.balanceOf(defaultAccountAddr);
  });
});
