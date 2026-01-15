import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment, useState } from "react";
import { CampaignDetail, SelectedOutcome } from "@/types";
import DetailBuyAction from "./detailBuyAction";
import DetailSellAction from "./detailSellAction";
import { combineClass } from "@/utils/combineClass";

interface DetailActionProps {
  shouldStopAction: boolean;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  data: CampaignDetail;
  price: string;
}
export default function DetailAction(props: DetailActionProps) {
  const [minimized, setMinimized] = useState(true);
  const [index, setIndex] = useState(0);
  return (
    <TabGroup onChange={(i) => setIndex(i)}>
      <TabList
        className={combineClass(
          minimized
            ? index === 0
              ? "bottom-[240px]"
              : "bottom-[150px]"
            : index === 0
              ? "bottom-[452px]"
              : "bottom-[362px]",
          "fixed right-[59px] z-10 flex items-center overflow-y-auto md:static",
        )}
      >
        <Tab as={Fragment}>
          {(props) => (
            <TabButton title="Buy" {...props} intent="buy" size={"medium"} />
          )}
        </Tab>
        {!(props.data.isDpm || props.data.isDppm) ? (
          <Tab as={Fragment}>
            {(props) => (
              <TabButton
                title="Sell"
                {...props}
                intent="sell"
                size={"medium"}
              />
            )}
          </Tab>
        ) : null}
      </TabList>
      <TabPanels>
        <TabPanel>
          <DetailBuyAction
            shouldStopAction={props.shouldStopAction}
            selectedOutcome={props.selectedOutcome}
            setSelectedOutcome={props.setSelectedOutcome}
            data={props.data}
            price={props.price}
            minimized={minimized}
            setMinimized={setMinimized}
          />
        </TabPanel>
        <TabPanel>
          <DetailSellAction
            shouldStopAction={props.shouldStopAction}
            selectedOutcome={props.selectedOutcome}
            setSelectedOutcome={props.setSelectedOutcome}
            data={props.data}
            price={props.price}
            minimized={minimized}
            setMinimized={setMinimized}
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
