import { initialProfile } from "@/lib/intial-profile";
import { currentUser } from "@clerk/nextjs/server";

const InviteCodeLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await currentUser();

  if (user) {
    await initialProfile();
  }

  return <>{children}</>;
};

export default InviteCodeLayout;
