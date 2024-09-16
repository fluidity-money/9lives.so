const {describe, it} = require("node:test");

const {Contract, ContractFactory, JsonRpcProvider, Log, MaxUint256, Provider, TypedDataDomain, Wallet, id } = require("ethers");
const {execSync} = require("node:child_process");

const TestERC20 = require("../out/TestERC20.sol/TestERC20.json");
const MockLongtail = require("../out/MockLongtail.sol/MockLongtail.json");
const Factory = require("../out/INineLivesFactory.sol/INineLivesFactory.json");
const Trading = require("../out/INineLivesTrading.sol/INineLivesTrading.json");

const DEPLOY_KEY = "0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659";

describe("End to end tests", async () => {
  const RPC_URL = process.env.SPN_SUPERPOSITION_URL;

  if (!RPC_URL) throw new Error("SPN_SUPERPOSITION_URL unset");

  const provider = new JsonRpcProvider(RPC_URL);

  const chainId = Number((await provider.getNetwork()).chainId);

  const signer = new Wallet(DEPLOY_KEY, provider);

  const defaultAccount = await signer.getAddress();

  // Deploy a test ERC20.

  const erc20Factory = new ContractFactory(
    TestERC20.abi,
    TestERC20.bytecode,
    signer
  );
  const erc20Deploy = await erc20Factory.deploy();
  await erc20Deploy.waitForDeployment();
  const erc20Address = await erc20Deploy.getAddress();

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

  const { factoryImpl, erc20Impl, tradingImpl } =
    JSON.parse(execSync(
      `go run scripts/get-addresses.go ${defaultAccount}`,
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
    "make -B",
    { env: {
        ...process.env,
        "SPN_FACTORY_IMPL_ADDR": factoryImpl,
        "SPN_ERC20_IMPL_ADDR": erc20Impl,
        "SPN_TRADING_IMPL_ADDR": tradingImpl,
        "SPN_FACTORY_PROXY_ADDR": factoryImpl, // Impl instead of proxy.
        "SPN_LONGTAIL_ADDR": longtailAddress,
        "SPN_FUSDC_ADDR": erc20Address,
    } },
  );

  // Do the deployments!

  execSync(
    "./deploy-stylus.sh factory.wasm",
    { env: {
        ...process.env,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY,
    } },
  );

  execSync(
    "./deploy-erc20-impl.sh",
    { env: {
        ...process.env,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY,
    } },
  );

  execSync(
    "./deploy-stylus.sh trading.wasm",
    { env: {
        ...process.env,
        "SPN_SUPERPOSITION_URL": RPC_URL,
        "SPN_SUPERPOSITION_KEY": DEPLOY_KEY,
    } },
  );

  const factory = new Contract(factoryImpl, Factory.abi, signer);

  await (await factory.ctor(defaultAccount)).wait();

  it("Should create a Trading contract fine", async () => {
    const tx = await factory.newTrading([
      {
        identifier: "0x1e9e51837f3ea6ea",
        seed: 100
      },
      {
        identifier: "0x1e9e51837f3ea6eb",
        seed: 100
      },
    ]);
    await tx.wait();
    console.log(tx);
  });
});
