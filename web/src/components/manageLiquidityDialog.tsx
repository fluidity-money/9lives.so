import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import AddLiquidityDialog from "./addLiquidityDialog";
import { CampaignDetail } from "@/types";
import Button from "./themed/button";
import { Fragment } from "react";
import RemoveLiquidityDialog from "./removeLiquidityDialog";
import ClaimLiquidityDialog from "./claimLiquidityDialog";
import formatFusdc from "@/utils/formatFusdc";

const VarButton = ({ title, value }: { title: string; value: string }) => (
  <div className="flex flex-1 items-center justify-between rounded-[3px] border-[1.5px] border-9black bg-9gray px-4 py-3 shadow-9liquidityVar">
    <span className="font-geneva text-xs uppercase">{title}</span>
    <span className="font-chicago text-lg">{value}</span>
  </div>
);
export default function ManageLiquidityDialog({
  data,
  APY,
  tabIndex,
  displayWithdrawBtn,
  displayClaimBtn,
  unclaimedRewards,
  userLiquidity,
}: {
  data: CampaignDetail;
  APY?: number;
  tabIndex: number;
  displayWithdrawBtn: boolean;
  displayClaimBtn: boolean;
  unclaimedRewards: bigint;
  userLiquidity?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h5 className="text-center font-chicago text-base">
        Supply Liquidity to the campaign?
      </h5>
      <div className="flex-col gap-4 rounded-[3px] border-[1.5px] border-9black bg-[#fafafa] p-5 text-xs shadow-9liqCard md:flex">
        <h4 className="text-center font-chicago text-xl">{`“${data.name}”`}</h4>
        <div className="flex items-center gap-2.5">
          <VarButton
            title="My liquidity"
            value={`$${formatFusdc(userLiquidity ?? "0")}`}
          />
          {APY && !data.winner ? (
            <VarButton title="Apy Rate" value={`%${+(APY * 100).toFixed(2)}`} />
          ) : null}
        </div>
        <p className="text-center font-chicago text-xs">
          Higher liquidity means better trading stability and lower slippage.
          <br />
          You can add liquidity to your campaign and earn provider rewards at
          any time.
        </p>
      </div>

      <TabGroup className={"flex flex-col gap-4"} selectedIndex={tabIndex}>
        <TabList className={"flex items-center gap-2"}>
          {data.winner ? null : (
            <Tab as={Fragment}>
              {(props) => (
                <Button
                  title="Add"
                  intent={props.selected ? "yes" : "default"}
                />
              )}
            </Tab>
          )}
          {displayWithdrawBtn && !data.winner ? (
            <Tab as={Fragment}>
              {(props) => (
                <Button
                  title="Withdraw"
                  intent={props.selected ? "no" : "default"}
                />
              )}
            </Tab>
          ) : null}
          {displayClaimBtn && data.winner ? (
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
          {data.winner ? null : (
            <TabPanel>
              <AddLiquidityDialog data={data} />
            </TabPanel>
          )}
          {displayWithdrawBtn && userLiquidity && !data.winner ? (
            <TabPanel>
              <RemoveLiquidityDialog
                userLiquidity={userLiquidity}
                data={data}
              />
            </TabPanel>
          ) : null}
          {displayClaimBtn && data.winner ? (
            <TabPanel>
              <ClaimLiquidityDialog
                unclaimedRewards={unclaimedRewards}
                tradingAddr={data.poolAddress}
                campaignId={data.identifier}
              />
            </TabPanel>
          ) : null}
          <TabPanel>
            <div className="flex-col gap-4 rounded-[3px] border-[1.5px] border-9black bg-[#fafafa] p-5 text-xs shadow-9liqCard md:flex">
              <p className="text-center font-chicago text-xs">
                Campaign is concluded.
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
