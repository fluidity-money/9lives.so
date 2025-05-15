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
  isDpm?: boolean;
}
export default function DetailAction(props: DetailActionProps) {
  const [minimized, setMinimized] = useState(true);
  return (
    <TabGroup>
      <TabList
        className={combineClass(
          minimized ? "bottom-[145px]" : "bottom-[381px]",
          "fixed right-[59px] z-10 flex items-center overflow-y-auto md:static",
        )}
      >
        <Tab as={Fragment}>
          {(props) => (
            <TabButton title="Buy" {...props} intent="buy" size={"medium"} />
          )}
        </Tab>
        {props.isDpm !== undefined && !props.isDpm && (
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
        )}
      </TabList>
      <TabPanels>
        <TabPanel>
          <DetailBuyAction
            shouldStopAction={props.shouldStopAction}
            selectedOutcome={props.selectedOutcome}
            setSelectedOutcome={props.setSelectedOutcome}
            data={props.data}
            isDpm={props.isDpm}
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
