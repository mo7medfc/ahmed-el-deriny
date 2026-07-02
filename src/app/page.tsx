import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { RootRedirect } from "@/components/RootRedirect";

export default function RootPage() {
  if (process.env.GITHUB_PAGES === "true") {
    return <RootRedirect />;
  }

  redirect(`/${routing.defaultLocale}`);
}
