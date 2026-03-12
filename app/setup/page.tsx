import { InitialModal } from "@/components/modals/initial-modal";
import { redirect } from "next/navigation";
import { getInitialServer } from "@/services/servers/servers-ssr-service";

const SetupPage = async () => {
  const server = await getInitialServer();

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
