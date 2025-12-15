import { initialProfile } from "@/lib/intial-profile";
import { db } from "@/lib/db";
import { InitialModal } from "@/components/modals/initial-modal";
import { redirect } from "next/navigation";
const SetupPage = async () => {
  const profile = await initialProfile();

  // if (!profile) {
  //   return <div>Error: No profile found</div>;
  // }

  const server = await db.server.findFirst({
    //tìm 1 server để redirect
    where: {
      members: {
        some: {
          profileId: profile?.id,
        },
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
};

export default SetupPage;
