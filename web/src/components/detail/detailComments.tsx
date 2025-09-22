import { Outcome } from "@/types";
import RetroCard from "../cardRetro";
import CommentComposer from "../comments/commentComposer";
import CommentList from "../comments/commentList";

export default function DetailComments({
  campaignId,
  creator,
  outcomes,
}: {
  campaignId: string;
  creator: string;
  outcomes: Outcome[];
}) {
  return (
    <RetroCard title="Comments" showClose={false}>
      <CommentComposer campaignId={campaignId} />
      <CommentList
        campaignId={campaignId}
        creator={creator}
        outcomes={outcomes}
      />
    </RetroCard>
  );
}
