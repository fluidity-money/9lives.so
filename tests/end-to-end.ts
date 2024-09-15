import {Contract, ContractFactory, JsonRpcProvider, Log, MaxUint256, Provider, TypedDataDomain, Wallet, id } from "ethers";
import {execSync} from "node:child_process";

test("End to end tests", async () => {
    const RPC_URL = process.env.SPN_SUPERPOSITION_URL
    if (!RPC_URL) throw new Error("SPN_SUPERPOSITION_URL unset");
    const provider = new JsonRpcProvider(RPC_URL)
    const chainId = Number((await provider.getNetwork()).chainId);
    const signer = new Wallet("0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659", provider)
    const defaultAccount = await signer.getAddress();
});
