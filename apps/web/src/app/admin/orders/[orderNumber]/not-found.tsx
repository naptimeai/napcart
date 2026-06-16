import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { AdminWorkspace, Panel } from "@/components/admin/phase45-ui";

export default function OrderNotFound() {
  return (
    <AdminWorkspace>
      <Panel className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#f1f1ef] text-[#555]">
          <SearchX className="size-7" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-normal text-[#111]">
          Order not found
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#777]">
          This order does not exist for the current restaurant, or it may have
          been removed from the active workspace.
        </p>
        <Link
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-[#f6f6f3]"
          href="/admin/orders"
        >
          <ArrowLeft className="size-4" />
          Back to orders
        </Link>
      </Panel>
    </AdminWorkspace>
  );
}
