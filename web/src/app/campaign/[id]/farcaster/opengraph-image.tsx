import detailImageGenerator from "@/components/detailImageGenerator";

export const size = {
  width: 1200,
  height: 800,
};
export const contentType = "image/png";
type Params = Promise<{ id: string }>;
export default async function ImageOG({ params }: { params: Params }) {
  const { id } = await params;
  return await detailImageGenerator(id);
}
