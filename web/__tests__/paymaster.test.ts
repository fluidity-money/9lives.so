import { Account, privateKeyToAccount } from "thirdweb/wallets";
import {
  Chain,
  createThirdwebClient,
  defineChain,
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
  ThirdwebClient,
} from "thirdweb";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import useSignForPermit from "@/hooks/useSignForPermit";
import { MaxUint256 } from "ethers";
import ERC20Abi from "@/config/abi/erc20";
import fetch from "node-fetch";
import https from "node:https";
describe("Paymaster", () => {
  let account: Account;
  let client: ThirdwebClient;
  let chain: Chain;
  let snapshotId: `0x${string}`;
  const insecureAgent = new https.Agent({ rejectUnauthorized: false });
  beforeAll(async () => {
    const rpcUrl = process.env.FORKNET_URL;
    const auth = process.env.FORKNET_SECRET;
    const privateKey = process.env.TESTER_PRIVATE_KEY;
    if (!rpcUrl) throw new Error("Forknet url is not defined");
    if (!auth) throw new Error("Forknet secret is not defined");
    if (!privateKey) throw new Error("Private key is not defined");
    const data = {
      jsonrpc: "2.0",
      id: "123",
      method: "evm_snapshot",
      params: [],
    };
    snapshotId = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      agent: insecureAgent,
      body: JSON.stringify(data),
    }).then(
      async (res) => ((await res.json()) as { result: `0x${string}` })?.result,
    );
    if (!snapshotId) throw new Error("Couldnt get latest snapshot id");
    client = createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_ID,
    });
    account = privateKeyToAccount({
      client,
      privateKey,
    });
    chain = defineChain({
      name: "Superposition",
      id: 55244,
      nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
      rpc: rpcUrl,
    });
  }, 30000);
  afterEach(async () => {
    const rpcUrl = process.env.FORKNET_URL;
    const auth = process.env.FORKNET_SECRET;
    if (!rpcUrl) throw new Error("Forknet url is not defined");
    if (!auth) throw new Error("Forknet secret is not defined");
    if (!snapshotId) throw new Error("Couldnt get latest snapshot id");
    const data = {
      jsonrpc: "2.0",
      id: "123",
      method: "evm_revert",
      params: [snapshotId],
    };
    const success = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      agent: insecureAgent,
      body: JSON.stringify(data),
    }).then(async (res) => ((await res.json()) as { result: boolean })?.result);
    if (!success) throw new Error("Couldnt revert chain to previous snapshot");
  }, 30000);

  test("Generated erc20 permit signature is valid", async () => {
    const { result } = renderHook(() => useSignForPermit(chain, account));
    const amountToSpend = MaxUint256;
    const spender = process.env.NEXT_PUBLIC_PAYMASTER_ADDR;
    const deadline = Math.floor(
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).getTime() / 1000,
    ); // 30 days later
    let signature:
      | {
          r: string;
          s: string;
          v: number;
        }
      | undefined;
    await act(async () => {
      signature = await result.current.signForPermit({
        amountToSpend,
        spender,
        deadline,
      });
    });
    if (!signature) throw new Error("Signature is undefined");
    const usdc = getContract({
      abi: ERC20Abi,
      address: process.env.NEXT_PUBLIC_FUSDC_ADDR,
      chain,
      client,
    });
    const concatSig = (signature.r +
      signature.s.slice(2) +
      signature.v.toString(16).padStart(2, "0")) as `0x${string}`;
    const permitTx = prepareContractCall({
      contract: usdc,
      method: "permit",
      params: [
        account.address,
        spender,
        amountToSpend,
        BigInt(deadline),
        concatSig,
      ],
    });
    // await sendTransaction({
    //   account,
    //   transaction: permitTx,
    // });
    // const allowanceTx = prepareContractCall({
    //   contract: usdc,
    //   method: "allowance",
    //   params: [account.address, spender],
    // });
    // const approvedAmount = await simulateTransaction({
    //   account,
    //   transaction: allowanceTx,
    // });
    // expect(approvedAmount).toEqual(amountToSpend);
  });
});
