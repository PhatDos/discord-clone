import { fetchWithAuth } from "@/lib/server-api-client";
import { InitialModal } from "@/components/modals/initial-modal";
import { redirect } from "next/navigation";
import type { Server } from "@prisma/client";

const SetupPage = async () => {

  const response = await fetchWithAuth((client, config) =>
    client.get<Server | null>("/servers/initial", config)
  );
  const server = response.data;

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
