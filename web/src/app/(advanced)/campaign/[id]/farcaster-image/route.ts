import detailImageGenerator from "@/components/detailImageGenerator";

const size = {
  width: 1200,
  height: 800,
};
type Params = Promise<{ id: string }>;
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  return await detailImageGenerator(id, size);
}
