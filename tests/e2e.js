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

describe("End to end tests", async () => {
  const RPC_URL = process.env.SPN_SUPERPOSITION_URL;
  const DEPLOY_KEY = process.env.SPN_SUPERPOSITION_KEY;

  const provider = new JsonRpcProvider(RPC_URL);

  const chainId = Number((await provider.getNetwork()).chainId);

  const signer = new Wallet(DEPLOY_KEY, provider);

  const defaultAccountAddr = await signer.getAddress();
  const emergencyCouncilAddr = defaultAccountAddr;

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

  // Do the actual building and deployment, pointing everything to the
  // factory implementation instead of the proxy.

  const { lockupAddr } = JSON.parse(execSync(
    "./build-and-deploy.sh",
    {
      env: {
        ...process.env,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY,
        "SPN_AMM_ADDR": longtailAddress,
        "SPN_FUSDC_ADDR": fusdcAddress,
        "SPN_PROXY_ADMIN": defaultAccountAddr,
        "SPN_EMERGENCY_COUNCIL": emergencyCouncilAddr
      },
      stdio: ["ignore", "ignore", "ignore"]
    },
  ));

  const factoryProxy = new Contract(
    factoryProxyAddr,
    Factory.abi,
    signer
  );

  assert.equal(
    erc20Impl.toLowerCase(),
    (await factoryProxy.erc20Impl()).toLowerCase()
  );

  const outcome1 = "0x1e9e51837f3ea6ea";
  const outcome2 = "0x1e9e51837f3ea6eb";

  const outcomes = [
    {
      identifier: outcome1,
      amount: 1e6
    },
    {
      identifier: outcome2,
      amount: 1e6
    },
  ];

  const outcomeBals = Buffer.alloc(32);
  Buffer.from(outcome1.substr(-16), "hex").copy(outcomeBals, 0);
  Buffer.from(outcome2.substr(-16), "hex").copy(outcomeBals, 8);

  await (await fusdc.approve(factoryProxyAddr, MaxUint256)).wait();

  const tradingAddr = await factoryProxy.newTradingC11AAA3B.staticCall(outcomes);
  await (await factoryProxy.newTradingC11AAA3B(outcomes)).wait();

  const trading = new Contract(tradingAddr, Trading.abi, signer);

  const share1Addr = await trading.shareAddr(outcome1);
  const share1 = new Contract(share1Addr, TestERC20.abi, signer);

  await (await fusdc.approve(tradingAddr, MaxUint256)).wait();

  it("Should support minting shares, then activating payoff, and receiving all of the pool.", async () => {
    const balBefore = await share1.balanceOf(defaultAccountAddr);
    await (await trading.mint227CF432(outcome1, 6 * 1e6, defaultAccountAddr)).wait();
    const balAfter = await share1.balanceOf(defaultAccountAddr);
    assert.equal(balAfter, "4476926");
    await (await trading.decide(outcome1)).wait();
    const fusdcBalBefore = await fusdc.balanceOf(defaultAccountAddr);
    await (await trading.payoff(outcome1, balAfter, defaultAccountAddr)).wait();
    assert.equal(await share1.balanceOf(defaultAccountAddr), "0");
    assert.ok(await fusdc.balanceOf(defaultAccountAddr) > fusdcBalBefore);
  });
});
