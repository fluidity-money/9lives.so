import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import AddLiquidityDialog from "./addLiquidityDialog";
import { CampaignDetail } from "@/types";
import Button from "./themed/button";
import { Fragment, useEffect, useState } from "react";
import RemoveLiquidityDialog from "./removeLiquidityDialog";
import useUserLiquidity from "@/hooks/useUserLiquidity";
import { useActiveAccount } from "thirdweb/react";
import useLiquidity from "@/hooks/useLiquidity";
import ClaimLiquidityDialog from "./claimLiquidityDialog";

const VarButton = ({ title, value }: { title: string; value: string }) => (
  <div className="flex flex-1 items-center justify-between rounded-[3px] border-[1.5px] border-9black bg-9gray px-4 py-3 shadow-9liquidityVar">
    <span className="font-geneva text-xs uppercase">{title}</span>
    <span className="font-chicago text-lg">{value}</span>
  </div>
);
export default function ManageLiquidityDialog({
  data,
}: {
  data: CampaignDetail;
}) {
  const account = useActiveAccount();
  const [unclaimedRewards, setUnclaimedRewards] = useState(BigInt(0));
  const { checkLpRewards } = useLiquidity({
    tradingAddr: data.poolAddress,
    campaignId: data.identifier,
  });
  const { data: userLiquidity, isSuccess } = useUserLiquidity({
    address: account?.address,
    tradingAddr: data.poolAddress,
  });
  const displayWithdrawBtn =
    isSuccess &&
    Number(userLiquidity) > 0 &&
    Number(data.liquidityVested) > 1e6;
  const displayClaimBtn = unclaimedRewards && unclaimedRewards > BigInt(0);

  useEffect(() => {
    (async function () {
      if (!account) return;
      const fees = await checkLpRewards(account);
      if (fees && BigInt(fees) > BigInt(0)) {
        setUnclaimedRewards(fees);
      }
    })();
  }, [account, checkLpRewards]);

  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-center font-chicago text-base">
        Supply Liquidity to the campaign?
      </h5>
      <div className="flex-col gap-4 rounded-[3px] border-[1.5px] border-9black bg-[#fafafa] p-5 text-xs shadow-9liqCard md:flex">
        <h4 className="text-center font-chicago text-xl">{`“${data.name}”`}</h4>
        <div className="flex items-center gap-2.5">
          <VarButton title="My liquidity" value="$500" />
          <VarButton title="Apy Rate" value="%50" />
        </div>
        <p className="text-center font-chicago text-xs">
          Higher liquidity means better trading stability and lower slippage.
          <br />
          You can add liquidity to your campaign and earn provider rewards at
          any time.
        </p>
      </div>

      <TabGroup className={"flex flex-col gap-4"}>
        <TabList className={"flex items-center gap-2"}>
          <Tab as={Fragment}>
            {(props) => (
              <Button title="Add" intent={props.selected ? "yes" : "default"} />
            )}
          </Tab>
          {displayWithdrawBtn ? (
            <Tab as={Fragment}>
              {(props) => (
                <Button
                  title="Withdraw"
                  intent={props.selected ? "no" : "default"}
                />
              )}
            </Tab>
          ) : null}
          {displayClaimBtn ? (
            <Tab as={Fragment}>
              {(props) => (
                <Button
                  title="Claim"
                  intent={props.selected ? "cta" : "default"}
                />
              )}
            </Tab>
          ) : null}
        </TabList>
        <TabPanels>
          <TabPanel>
            <AddLiquidityDialog data={data} />
          </TabPanel>
          {displayWithdrawBtn ? (
            <TabPanel>
              <RemoveLiquidityDialog
                userLiquidity={userLiquidity}
                data={data}
              />
            </TabPanel>
          ) : null}
          {displayClaimBtn ? (
            <TabPanel>
              <ClaimLiquidityDialog
                unclaimedRewards={unclaimedRewards}
                tradingAddr={data.poolAddress}
                campaignId={data.identifier}
              />
            </TabPanel>
          ) : null}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
