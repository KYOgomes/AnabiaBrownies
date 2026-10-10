import { Nav } from "@/components/nav";
import { TopBar } from "@/components/top-bar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-5">{children}</main>
      <Nav />
    </>
  );
}
