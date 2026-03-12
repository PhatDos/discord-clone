import { InitialModal } from "@/components/modals/initial-modal";
import { redirect } from "next/navigation";
import { getInitialServer } from "@/services/servers/servers-ssr-service";
import { initialProfile } from "@/lib/intial-profile";

const SetupPage = async () => {
  await initialProfile();

  const server = await getInitialServer();

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
