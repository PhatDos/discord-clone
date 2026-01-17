import { Loader } from "@/components/loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white">
        <Loader />
    </div>
  );
}
