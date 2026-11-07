
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import ShortLink from "@/models/ShortLink";
import LocationPermission from "./LocationPermission";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ShortLinkPage({ params }: Props) {
  const { code } = await params;

  if (
    !/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(code) ||
    code.length > 80
  ) {
    notFound();
  }

  await connectDB();

  const link = await ShortLink.findOne({
    code: code.toLowerCase(),
    isActive: true,
  })
    .select("url")
    .lean();

  if (!link) {
    notFound();
  }

  let destination: string;

  try {
    const parsedUrl = new URL(link.url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      notFound();
    }

    destination = parsedUrl.toString();
  } catch {
    notFound();
  }

  return <LocationPermission code={code.toLowerCase()} destination={destination} />;
}
