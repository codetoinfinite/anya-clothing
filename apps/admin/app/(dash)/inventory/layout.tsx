import { requireRead } from "@/lib/roles";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRead("/inventory");
  return children;
}
