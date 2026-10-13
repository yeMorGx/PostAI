import { DeliveryPackage, type DeliveryChannel } from "@/features/reference/delivery-package";

export default async function DeliveryPage({ searchParams }: { searchParams: Promise<{ channel?: string }> }) {
  const { channel } = await searchParams;
  const initialChannel = ["blog", "lkart", "lkpost", "news", "carrossel"].includes(channel ?? "") ? channel as DeliveryChannel : "carrossel";
  return <DeliveryPackage key={initialChannel} initialChannel={initialChannel}/>;
}
