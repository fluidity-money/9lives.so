import ERC20Abi from "@/config/abi/erc20";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import { usePublicClient, useWriteContract } from "wagmi";

interface AllowanceCheckProps {
  contractAddress: string;
  spenderAddress: string;
  address: string;
  amount: bigint;
  checkBalance?: boolean;
}
export function useAllowanceCheck() {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const { mutateAsync: writeContract } = useWriteContract();
  const publicClient = usePublicClient();
  const check = async ({
    contractAddress,
    spenderAddress,
    address,
    amount,
    checkBalance = true,
  }: AllowanceCheckProps) => {
    if (!publicClient) throw new Error("Public client is not set");
    const erc20Contract = {
      address: contractAddress as `0x${string}`,
      abi: ERC20Abi,
    } as const;
    
    await checkAndSwitchChain();

    if (checkBalance) {
      const balance = await publicClient.readContract({
        ...erc20Contract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      if (amount > balance) {
        throw new Error("Insufficient balance");
      }
    }

    const allowance = await publicClient.readContract({
      ...erc20Contract,
      functionName: "allowance",
      args: [address as `0x${string}`, spenderAddress as `0x${string}`],
    });
    return amount > allowance;
  };
  const approve = async ({
    contractAddress,
    spenderAddress,
    amount,
  }: Omit<AllowanceCheckProps, "address">) => {
    const erc20Contract = {
      address: contractAddress as `0x${string}`,
      abi: ERC20Abi,
    } as const;

    await checkAndSwitchChain();
    await writeContract({
      ...erc20Contract,
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, amount],
    });
  };
  const checkAndAprove = async ({
    contractAddress,
    spenderAddress,
    address,
    amount,
  }: AllowanceCheckProps) => {
    const shouldApprove = await check({
      contractAddress,
      spenderAddress,
      address,
      amount,
    });
    if (shouldApprove) {
      await approve({ contractAddress, spenderAddress, amount });
    }
  };
  return { check, approve, checkAndAprove };
}
