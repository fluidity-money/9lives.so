import RetroCard from "../cardRetro";
import CommentComposer from "../comments/commentComposer";
import CommentList from "../comments/commentList";

export default function DetailComments({
  campaignId,
  creator,
}: {
  campaignId: string;
  creator: string;
}) {
  return (
    <RetroCard title="Comments" showClose={false}>
      <CommentComposer campaignId={campaignId} />
      <CommentList campaignId={campaignId} creator={creator} />
    </RetroCard>
  );
}
