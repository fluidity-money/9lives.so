import DetailCall2Action from "@/components/detail/detailAction";
import DetailHeader from "@/components/detail/detailHeader";

export default function DetailPage() {
  return (
    <section className="flex gap-4">
      <div className="flex-[2]">
        <DetailHeader />
      </div>
      <div className="flex-1">
        <DetailCall2Action />
      </div>
    </section>
  );
}
