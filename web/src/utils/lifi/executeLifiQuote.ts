import { sendTransaction } from "thirdweb";
import { getStepTransaction } from "./getStepTx";
import { getStatus } from "./getStatus";
import { Account } from "thirdweb/wallets";
// Simplified example function to execute each step of the route sequentially
export async function executeRouteSteps(route: any, account: Account) {
  for (const _step of route.steps) {
    // Request transaction data for the current step
    const step = await getStepTransaction(_step);

    // Send the transaction (e.g. using Viem)
    const receipt = await sendTransaction({
      transaction: step.transactionRequest,
      account,
    });

    // Monitor the status of the transaction
    let status;
    do {
      const result = await getStatus({
        txHash: receipt.transactionHash,
        fromChain: step.action.fromChainId,
        toChain: step.action.toChainId,
        bridge: step.tool,
      });
      status = result.status;

      console.log(`Transaction status for ${receipt.transactionHash}:`, status);

      // Wait for a short period before checking the status again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } while (status !== "DONE" && status !== "FAILED");

    if (status === "FAILED") {
      console.error(`Transaction ${receipt.transactionHash} failed`);
      return;
    }
  }

  console.log("All steps executed successfully");
}
