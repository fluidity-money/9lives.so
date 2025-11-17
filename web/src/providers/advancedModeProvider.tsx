"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BuyAndSellResponse, CreationResponse } from "@/types";
import {
  formatActionFromBuysAndSells,
  formatActionFromCreation,
} from "@/utils/format/formatActions";

export default function AdvancedModeProvider({
  initialData,
}: {
  initialData?: {
    degenBuysAndSells: BuyAndSellResponse;
    degenCreations: CreationResponse;
  };
}) {
  const client = useQueryClient();
  useEffect(() => {
    if (initialData) {
      const buyAndSellActions =
        initialData.degenBuysAndSells.ninelives_buys_and_sells_1.map((e) =>
          formatActionFromBuysAndSells(e),
        );
      const creationActions =
        initialData.degenCreations.ninelives_campaigns_1.map((c) =>
          formatActionFromCreation(c),
        );
      client.setQueryDefaults(["actions"], {
        initialData: [...creationActions, ...buyAndSellActions].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
      });
    }
  }, [initialData, client]);
  return null;
}
