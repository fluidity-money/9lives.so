import config from "@/config";
import ERC20Abi from "@/config/abi/erc20";
import useCheckAndSwitchChain from "@/hooks/useCheckAndSwitchChain";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";
interface AllowanceCheckProps {
  contractAddress: string;
  spenderAddress: string;
  account: Account;
  amount: bigint;
  checkBalance?: boolean;
}
export function useAllowanceCheck() {
  const { checkAndSwitchChain } = useCheckAndSwitchChain();
  const check = async ({
    contractAddress,
    spenderAddress,
    account,
    amount,
    checkBalance = true,
  }: AllowanceCheckProps) => {
    const erc20Contract = getContract({
      address: contractAddress,
      abi: ERC20Abi,
      client: config.thirdweb.client,
      chain: config.destinationChain,
    });
    if (checkBalance) {
      const balanceOfTx = prepareContractCall({
        contract: erc20Contract,
        method: "balanceOf",
        params: [account.address],
      });
      const balance = (await simulateTransaction({
        transaction: balanceOfTx,
        account: account,
      })) as string;
      if (amount > BigInt(balance)) {
        throw new Error("Insufficient balance");
      }
    }
    const allowanceTx = prepareContractCall({
      contract: erc20Contract,
      method: "allowance",
      params: [account.address, spenderAddress],
    });
    const allowance = await simulateTransaction({
      transaction: allowanceTx,
      account: account,
    });
    return amount > allowance;
  };
  const approve = async ({
    contractAddress,
    spenderAddress,
    account,
    amount,
  }: AllowanceCheckProps) => {
    const erc20Contract = getContract({
      address: contractAddress,
      abi: ERC20Abi,
      client: config.thirdweb.client,
      chain: config.destinationChain,
    });
    const approveTx = prepareContractCall({
      contract: erc20Contract,
      method: "approve",
      params: [spenderAddress, amount],
    });
    await checkAndSwitchChain();
    await sendTransaction({
      transaction: approveTx,
      account,
    });
  };
  const checkAndAprove = async ({
    contractAddress,
    spenderAddress,
    account,
    amount,
  }: AllowanceCheckProps) => {
    const shouldApprove = await check({
      contractAddress,
      spenderAddress,
      account,
      amount,
    });
    if (shouldApprove) {
      await approve({ contractAddress, spenderAddress, account, amount });
    }
  };
  return { check, approve, checkAndAprove };
}
