import { renderHook } from "@testing-library/react";
import { act } from "react";
import { createPublicClient, http, PublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import { MaxUint256 } from "ethers";
import useSignForPermit from "@/hooks/useSignForPermit";
import ERC20Abi from "@/config/abi/erc20";
describe("Paymaster", () => {
  let account: ReturnType<typeof privateKeyToAccount>;
  let chain: ReturnType<typeof defineChain>;
  let publicClient: PublicClient;
  let snapshotId: `0x${string}`;
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
      body: JSON.stringify(data),
    }).then(
      async (res) => ((await res.json()) as { result: `0x${string}` })?.result,
    );
    if (!snapshotId) throw new Error("Couldnt get latest snapshot id");

    chain = defineChain({
      id: 55244,
      name: "Superposition",
      nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: [rpcUrl],
        },
      },
    });

    account = privateKeyToAccount(privateKey as `0x${string}`);

    publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl, {
        fetchOptions: {
          headers: {
            Authorization: auth,
          },
        },
      }),
    }) as PublicClient;
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
      body: JSON.stringify(data),
    }).then(async (res) => ((await res.json()) as { result: boolean })?.result);
    if (!success) throw new Error("Couldnt revert chain to previous snapshot");
  }, 30000);

  test("Generated erc20 permit signature is valid", async () => {
    const { result } = renderHook(() => useSignForPermit(account.address));
    const amountToSpend = MaxUint256;
    const spender = process.env.NEXT_PUBLIC_PAYMASTER_ADDR;
    const deadline = Math.floor(
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).getTime() / 1000,
    ); // 30 days later
    let signature:
      | {
          r: `0x${string}`;
          s: `0x${string}`;
          v: bigint | undefined;
        }
      | undefined;
    await act(async () => {
      signature = await result.current.signForPermit({
        amountToSpend,
        spender,
        deadline,
      });
    });
    if (!signature || !signature.v) throw new Error("Signature is undefined");
    const usdcAddress = process.env.NEXT_PUBLIC_FUSDC_ADDR as `0x${string}`;
    const concatSig = (signature.r +
      signature.s.slice(2) +
      signature.v.toString(16).padStart(2, "0")) as `0x${string}`;
    await publicClient.simulateContract({
      address: usdcAddress,
      abi: ERC20Abi,
      functionName: "permit",
      args: [
        account.address,
        spender as `0x${string}`,
        amountToSpend,
        BigInt(deadline),
        concatSig,
      ],
    });
    const approvedAmount = await publicClient.readContract({
      address: usdcAddress,
      abi: ERC20Abi,
      functionName: "allowance",
      args: [account.address, spender as `0x${string}`],
    });
    expect(approvedAmount).toEqual(amountToSpend);
  }, 30000);
});
