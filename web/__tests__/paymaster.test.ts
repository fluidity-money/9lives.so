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
import { renderHook, act } from "@testing-library/react-hooks";
import useSignForPermit from "@/hooks/useSignForPermit";
import { MaxUint256, SignatureLike } from "ethers";
import ERC20Abi from "@/config/abi/erc20";

describe("Paymaster", () => {
  let account: Account;
  let client: ThirdwebClient;
  let chain: Chain;
  let snapshotId: `0x${string}`;
  beforeAll(async () => {
    const rpcUrl = process.env.FORKNET;
    const auth = process.env.FORKNET_SECRET;
    const privateKey = process.env.PRIVATE_KEY;
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
      body: JSON.stringify(data),
    }).then(
      async (res) => (
        console.log("RES", res),
        ((await res.json()) as { result: `0x${string}` })?.result
      ),
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
    const rpcUrl = process.env.FORKNET;
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
      body: JSON.stringify(data),
    }).then(async (res) => ((await res.json()) as { result: boolean })?.result);
    if (!success) throw new Error("Couldnt revert chain to previous snapshot");
  }, 30000);

  test("Generated erc20 permit signature is valid", async () => {
    const { result } = renderHook(() => useSignForPermit());
    const amountToSpend = MaxUint256;
    const spender = process.env.NEXT_PUBLIC_PAYMASTER_ADDR;
    const deadline = Math.floor(
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).getTime() / 1000,
    ); // 30 days later
    let signature: SignatureLike;
    act(async () => {
      signature = await result.current.signForPermit({
        amountToSpend,
        spender,
        deadline,
      });
      expect(signature).not.toBeUndefined();
      const usdc = getContract({
        abi: ERC20Abi,
        address: process.env.NEXT_PUBLIC_FUSDC_ADDR,
        chain,
        client,
      });
      const permitTx = prepareContractCall({
        contract: usdc,
        method: "permit",
        params: [
          account.address,
          spender,
          amountToSpend,
          BigInt(deadline),
          Number(signature.v),
          signature.r as `0x${string}`,
          signature.s as `0x${string}`,
        ],
      });
      await sendTransaction({
        account,
        transaction: permitTx,
      });
      const allowanceTx = prepareContractCall({
        contract: usdc,
        method: "allowance",
        params: [account.address, spender],
      });
      const approvedAmount = simulateTransaction({
        account,
        transaction: allowanceTx,
      });
      expect(approvedAmount).toEqual(amountToSpend);
    });
  });
});
