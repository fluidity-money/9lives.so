import TabButton from "../tabButton";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment } from "react";
import { CampaignDetail, SelectedOutcome } from "@/types";
import DetailBuyAction from "./detailBuyAction";
import DetailSellAction from "./detailSellAction";

interface DetailActionProps {
  shouldStopAction: boolean;
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  data: CampaignDetail;
  price: string;
  isDpm?: boolean;
}
export default function DetailAction(props: DetailActionProps) {
  return (
    <TabGroup>
      <TabList className="flex items-center overflow-y-auto">
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
            price={props.price}
          />
        </TabPanel>
        <TabPanel>
          <DetailSellAction
            shouldStopAction={props.shouldStopAction}
            selectedOutcome={props.selectedOutcome}
            setSelectedOutcome={props.setSelectedOutcome}
            data={props.data}
            price={props.price}
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
