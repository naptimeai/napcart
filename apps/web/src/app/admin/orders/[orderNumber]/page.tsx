import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  History,
  MessageCircleMore,
  Package,
  Phone,
  ReceiptText,
  Send,
  ShoppingBag,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { OrderStatus } from "@prisma/client";
import {
  AdminWorkspace,
  IconBubble,
  PageTitle,
  Panel,
  PanelHeader,
  ProductThumb,
  StatusBadge,
  formatAdminMoney,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { applyAdminMockWhatsappAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getAdminOrderDetailData } from "@/server/repositories/restaurant-admin";

type OrderDetailPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams?: Promise<{
    notice?: string;
    error?: string;
  }>;
};

type MockStaffAction = {
  action: "confirm" | "cancel";
  label: string;
  token: string;
};

function formatStatus(status: OrderStatus | string | null | undefined) {
  if (!status) {
    return "None";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(status: OrderStatus): "green" | "yellow" | "red" | "gray" {
  if (status === OrderStatus.CONFIRMED) {
    return "green";
  }

  if (status === OrderStatus.PENDING_CONFIRMATION) {
    return "yellow";
  }

  if (status === OrderStatus.CANCELLED) {
    return "red";
  }

  return "gray";
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function safeJsonPreview(value: unknown) {
  if (!value) {
    return "No payload recorded.";
  }

  try {
    const serialized = JSON.stringify(value, null, 2);
    return serialized.length > 1800
      ? `${serialized.slice(0, 1800)}\n...truncated for admin preview`
      : serialized;
  } catch {
    return "Unable to render payload preview.";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getMockStaffActions(
  logs: Array<{ payloadJson: unknown }>,
): MockStaffAction[] {
  for (const log of logs) {
    if (!isRecord(log.payloadJson)) {
      continue;
    }

    const actions = log.payloadJson.interactiveActions;
    if (!Array.isArray(actions)) {
      continue;
    }

    const parsedActions = actions.flatMap((action): MockStaffAction[] => {
      if (!isRecord(action)) {
        return [];
      }

      const actionType = action.action;
      const token = action.token;
      const label = action.label;

      if (
        (actionType !== "confirm" && actionType !== "cancel") ||
        typeof token !== "string"
      ) {
        return [];
      }

      return [
        {
          action: actionType,
          label:
            typeof label === "string"
              ? label
              : actionType === "confirm"
                ? "Confirm"
                : "Cancel",
          token,
        },
      ];
    });

    if (parsedActions.length) {
      return parsedActions;
    }
  }

  return [];
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const session = await requireAdminSession();
  const { orderNumber } = await params;
  const resolvedSearchParams = await searchParams;
  const order = await getAdminOrderDetailData(
    session.restaurantId,
    decodeURIComponent(orderNumber),
  );

  if (!order) {
    notFound();
  }

  const confirmedOrCancelledAt =
    order.status === OrderStatus.CONFIRMED
      ? order.confirmedAt
      : order.status === OrderStatus.CANCELLED
        ? order.cancelledAt
        : null;
  const totalAddonLines = order.items.reduce(
    (total, item) => total + item.addons.length,
    0,
  );
  const mockStaffActions = getMockStaffActions(order.whatsappMessageLogs);
  const canApplyMockStaffAction =
    order.status === OrderStatus.PENDING_CONFIRMATION &&
    mockStaffActions.length > 0;
  const currentPath = `/admin/orders/${encodeURIComponent(order.orderNumber)}`;

  return (
    <AdminWorkspace>
      <div className="space-y-6">
        {resolvedSearchParams?.notice ? (
          <PageNotice message={resolvedSearchParams.notice} />
        ) : null}
        {resolvedSearchParams?.error ? (
          <PageNotice message={resolvedSearchParams.error} tone="error" />
        ) : null}

        <PageTitle
          action={
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] transition hover:bg-[#f6f6f3]"
              href="/admin/orders"
            >
              <ArrowLeft className="size-4" />
              Back to orders
            </Link>
          }
          description="Inspect the complete stored order snapshot, status trail, and provider activity for this restaurant."
          title={`Order ${order.orderNumber}`}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Panel className="p-5">
            <div className="flex items-start gap-4">
              <IconBubble icon={ReceiptText} />
              <div>
                <p className="text-sm font-semibold text-[#111]">
                  Order status
                </p>
                <div className="mt-3">
                  <StatusBadge dot tone={statusTone(order.status)}>
                    {formatStatus(order.status)}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm text-[#777]">
                  Placed {formatDateTime(order.placedAt)}
                </p>
              </div>
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-start gap-4">
              <IconBubble icon={ShoppingBag} />
              <div>
                <p className="text-sm font-semibold text-[#111]">Order value</p>
                <p className="mt-2 text-3xl font-semibold text-[#111]">
                  {formatAdminMoney(order.grandTotal, order.currency)}
                </p>
                <p className="mt-2 text-sm text-[#777]">
                  {order.items.length} item
                  {order.items.length === 1 ? "" : "s"} · {totalAddonLines}{" "}
                  add-on
                  {totalAddonLines === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-start gap-4">
              <IconBubble icon={Building2} />
              <div>
                <p className="text-sm font-semibold text-[#111]">
                  Branch route
                </p>
                <p className="mt-2 text-xl font-semibold text-[#111]">
                  {order.branchNameSnapshot}
                </p>
                <p className="mt-2 text-sm text-[#777]">
                  {formatEnum(order.fulfillmentType)}
                </p>
              </div>
            </div>
          </Panel>
          <Panel className="p-5">
            <div className="flex items-start gap-4">
              <IconBubble icon={MessageCircleMore} />
              <div>
                <p className="text-sm font-semibold text-[#111]">
                  Provider logs
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#111]">
                  {order.whatsappMessageLogs.length}
                </p>
                <p className="mt-2 text-sm text-[#777]">
                  {order.whatsappConnection
                    ? `${formatEnum(order.whatsappConnection.provider)} route`
                    : "No route attached"}
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {canApplyMockStaffAction ? (
          <Panel className="border-[var(--admin-primary-border)] bg-[var(--admin-primary-softer)] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <IconBubble icon={MessageCircleMore} />
                <div>
                  <h2 className="text-lg font-semibold text-[#111]">
                    Mock WhatsApp staff action
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#666]">
                    Use this only for local/demo testing while Meta WhatsApp is
                    not connected. It uses the signed Confirm/Cancel tokens from
                    the stored mock staff notification and records the same
                    status/provider audit trail.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {mockStaffActions.map((action) => (
                  <form action={applyAdminMockWhatsappAction} key={action.action}>
                    <input name="redirectTo" type="hidden" value={currentPath} />
                    <input
                      name="orderNumber"
                      type="hidden"
                      value={order.orderNumber}
                    />
                    <input name="action" type="hidden" value={action.action} />
                    <input name="token" type="hidden" value={action.token} />
                    <button
                      className={
                        action.action === "confirm"
                          ? "inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-[10px] bg-[var(--admin-primary)] px-5 text-sm font-semibold !text-white shadow-[0_14px_28px_rgba(100,43,147,0.22)] transition hover:bg-[var(--admin-primary-dark)]"
                          : "inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-[10px] border border-[#f0c7cc] bg-white px-5 text-sm font-semibold text-[#c73645] transition hover:bg-[#fff3f4]"
                      }
                      type="submit"
                    >
                      {action.action === "confirm" ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      {action.label} order
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </Panel>
        ) : null}

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,390px)]">
          <div className="min-w-0 space-y-6">
            <Panel className="p-6">
              <PanelHeader
                description="Stored customer and fulfillment snapshot captured at checkout."
                title="Customer and fulfillment"
              />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoBlock
                  icon={UserRound}
                  label="Customer"
                  primary={order.customerNameSnapshot}
                  secondary={[
                    order.customerPhoneSnapshot,
                    order.customer
                      ? `${order.customer.totalOrdersCount} total order${
                          order.customer.totalOrdersCount === 1 ? "" : "s"
                        }`
                      : "Guest snapshot only",
                  ]}
                />
                <InfoBlock
                  icon={Phone}
                  label="Contact"
                  primary={order.customerPhoneSnapshot}
                  secondary={[
                    order.customer?.email ?? "No email stored",
                    order.customer?.id
                      ? `Customer ID ${order.customer.id.slice(0, 8).toUpperCase()}`
                      : "No linked customer record",
                  ]}
                />
                <InfoBlock
                  icon={Building2}
                  label="Branch"
                  primary={order.branchNameSnapshot}
                  secondary={[
                    order.branch.addressText,
                    order.branch.isAcceptingOrders
                      ? "Branch accepting orders"
                      : "Branch currently paused",
                  ]}
                />
                <InfoBlock
                  icon={Package}
                  label="Delivery details"
                  primary={
                    order.addressTextSnapshot ??
                    (order.fulfillmentType === "PICKUP"
                      ? "Pickup order"
                      : "No address captured")
                  }
                  secondary={[
                    order.deliveryNotes ?? "No delivery notes",
                    confirmedOrCancelledAt
                      ? `Final update ${formatDateTime(confirmedOrCancelledAt)}`
                      : "No final confirmation timestamp yet",
                  ]}
                />
              </div>
            </Panel>

            <Panel className="p-6">
              <PanelHeader
                description="Item names, variations, add-ons, notes, and line totals are preserved as order snapshots."
                title="Items ordered"
              />
              <div className="mt-6 overflow-hidden rounded-[16px] border border-[#e5e5e1]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-[#e7e7e3] bg-[#fafaf8] text-xs font-semibold tracking-[0.08em] text-[#777] uppercase">
                      <tr>
                        <th className="px-5 py-4">Item</th>
                        <th className="px-5 py-4">Qty</th>
                        <th className="px-5 py-4">Unit</th>
                        <th className="px-5 py-4 text-right">Line total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ededeb]">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <ProductThumb
                                alt={item.productNameSnapshot}
                                className="size-12"
                              />
                              <div>
                                <p className="font-semibold text-[#111]">
                                  {item.productNameSnapshot}
                                </p>
                                {item.variantNameSnapshot ? (
                                  <p className="mt-1 text-xs text-[#777]">
                                    Variation: {item.variantNameSnapshot}
                                  </p>
                                ) : null}
                                {item.itemNotes ? (
                                  <p className="mt-1 text-xs text-[#777]">
                                    Note: {item.itemNotes}
                                  </p>
                                ) : null}
                                {item.addons.length ? (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {item.addons.map((addon) => (
                                      <span
                                        className="rounded-full bg-[#f1f1ef] px-2.5 py-1 text-xs font-medium text-[#555]"
                                        key={addon.id}
                                      >
                                        {addon.addonNameSnapshot} ·{" "}
                                        {formatAdminMoney(
                                          addon.lineTotal,
                                          order.currency,
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-[#111]">
                            {item.quantity}
                          </td>
                          <td className="px-5 py-4 text-[#333]">
                            {formatAdminMoney(item.unitPrice, order.currency)}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-[#111]">
                            {formatAdminMoney(item.lineTotal, order.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>

            <Panel className="p-6">
              <PanelHeader
                description="Status changes are append-only audit records from system, WhatsApp staff action, or admin workflows."
                title="Status history"
              />
              <div className="mt-6 space-y-3">
                {order.statusHistory.length ? (
                  order.statusHistory.map((event) => (
                    <div
                      className="flex gap-4 rounded-[14px] border border-[#e5e5e1] bg-white p-4"
                      key={event.id}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                        <History className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge tone="gray">
                            {formatStatus(event.oldStatus)}
                          </StatusBadge>
                          <span className="text-xs text-[#777]">to</span>
                          <StatusBadge tone={statusTone(event.newStatus)}>
                            {formatStatus(event.newStatus)}
                          </StatusBadge>
                        </div>
                        <p className="mt-2 text-sm text-[#111]">
                          Source: {formatEnum(event.changeSource)}
                          {event.changedByAdminUser
                            ? ` by ${event.changedByAdminUser.name}`
                            : ""}
                        </p>
                        {event.notes ? (
                          <p className="mt-1 text-sm text-[#777]">
                            {event.notes}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-xs text-[#777]">
                        {formatDateTime(event.changedAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyAuditState
                    icon={Clock3}
                    text="No status history has been recorded for this order yet."
                  />
                )}
              </div>
            </Panel>

            <Panel className="p-6">
              <PanelHeader
                description="Provider logs show outbound staff notifications, inbound staff actions, customer notifications, and failures."
                title="WhatsApp and provider logs"
              />
              <div className="mt-6 space-y-4">
                {order.whatsappMessageLogs.length ? (
                  order.whatsappMessageLogs.map((log) => (
                    <details
                      className="group rounded-[14px] border border-[#e5e5e1] bg-white p-4"
                      key={log.id}
                    >
                      <summary className="flex cursor-pointer list-none items-start gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
                          <Send className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                              dot
                              tone={log.status === "FAILED" ? "red" : "gray"}
                            >
                              {formatEnum(log.status)}
                            </StatusBadge>
                            <StatusBadge tone="gray">
                              {formatEnum(log.direction)}
                            </StatusBadge>
                          </div>
                          <p className="mt-2 font-semibold text-[#111]">
                            {log.messageType}
                          </p>
                          <p className="mt-1 text-sm text-[#777]">
                            {log.whatsappConnection
                              ? `${formatEnum(
                                  log.whatsappConnection.provider,
                                )} · ${log.whatsappConnection.displayPhoneNumber}`
                              : "No connection attached"}
                          </p>
                          {log.errorMessage ? (
                            <p className="mt-2 text-sm font-medium text-[#c73645]">
                              {log.errorMessage}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-xs text-[#777]">
                          {formatDateTime(log.createdAt)}
                        </p>
                      </summary>
                      <div className="mt-4 grid gap-4 border-t border-[#ededeb] pt-4 lg:grid-cols-2">
                        <LogMeta
                          label="Provider ID"
                          value={log.providerMessageId}
                        />
                        <LogMeta label="Template" value={log.templateName} />
                        <LogMeta
                          label="Sent"
                          value={formatDateTime(log.sentAt)}
                        />
                        <LogMeta
                          label="Received"
                          value={formatDateTime(log.receivedAt)}
                        />
                        <LogMeta
                          label="Processed"
                          value={formatDateTime(log.processedAt)}
                        />
                        <LogMeta
                          label="Updated"
                          value={formatDateTime(log.updatedAt)}
                        />
                        <div className="lg:col-span-2">
                          <p className="text-xs font-semibold tracking-[0.12em] text-[#777] uppercase">
                            Payload preview
                          </p>
                          <pre className="mt-2 max-h-96 overflow-auto rounded-[12px] bg-[#111] p-4 text-xs leading-5 text-white">
                            {safeJsonPreview(log.payloadJson)}
                          </pre>
                        </div>
                        {log.responseJson ? (
                          <div className="lg:col-span-2">
                            <p className="text-xs font-semibold tracking-[0.12em] text-[#777] uppercase">
                              Response preview
                            </p>
                            <pre className="mt-2 max-h-80 overflow-auto rounded-[12px] bg-[#f6f6f3] p-4 text-xs leading-5 text-[#111]">
                              {safeJsonPreview(log.responseJson)}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  ))
                ) : (
                  <EmptyAuditState
                    icon={MessageCircleMore}
                    text="No WhatsApp/provider logs exist yet. New storefront orders should create at least one outbound notification log."
                  />
                )}
              </div>
            </Panel>
          </div>

          <aside className="min-w-0 space-y-6">
            <Panel className="p-6">
              <PanelHeader title="Payment summary" />
              <div className="mt-6 space-y-4">
                <TotalRow
                  label="Subtotal"
                  value={formatAdminMoney(order.subtotal, order.currency)}
                />
                <TotalRow
                  label="Delivery fee"
                  value={formatAdminMoney(order.deliveryFee, order.currency)}
                />
                <TotalRow
                  label="Discount"
                  value={formatAdminMoney(order.discountTotal, order.currency)}
                />
                <TotalRow
                  label="Tax"
                  value={formatAdminMoney(order.taxTotal, order.currency)}
                />
                <div className="border-t border-[#e7e7e3] pt-4">
                  <TotalRow
                    emphasized
                    label="Grand total"
                    value={formatAdminMoney(order.grandTotal, order.currency)}
                  />
                </div>
              </div>
              <div className="mt-6 rounded-[14px] border border-[#e5e5e1] bg-[#fafaf8] p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 size-5 text-[#111]" />
                  <div>
                    <p className="font-semibold text-[#111]">
                      {formatEnum(order.paymentMethod)}
                    </p>
                    <p className="mt-1 text-sm text-[#777]">
                      Payment status: {formatEnum(order.paymentStatus)}
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel className="p-6">
              <PanelHeader
                description="Connection details are shown without encrypted access or webhook tokens."
                title="WhatsApp route"
              />
              {order.whatsappConnection ? (
                <div className="mt-6 space-y-4">
                  <RouteRow
                    label="Provider"
                    value={formatEnum(order.whatsappConnection.provider)}
                  />
                  <RouteRow
                    label="Business"
                    value={order.whatsappConnection.businessName}
                  />
                  <RouteRow
                    label="Display number"
                    value={order.whatsappConnection.displayPhoneNumber}
                  />
                  <RouteRow
                    label="Phone number ID"
                    value={order.whatsappConnection.phoneNumberId ?? "Not set"}
                  />
                  <RouteRow
                    label="Default route"
                    value={
                      order.whatsappConnection.isDefaultForRestaurant
                        ? "Yes"
                        : "No"
                    }
                  />
                  <div className="pt-2">
                    <StatusBadge
                      tone={
                        order.whatsappConnection.isActive ? "green" : "gray"
                      }
                    >
                      {order.whatsappConnection.isActive
                        ? "Active"
                        : "Inactive"}
                    </StatusBadge>
                  </div>
                </div>
              ) : (
                <EmptyAuditState
                  icon={MessageCircleMore}
                  text="No WhatsApp connection was attached to this order."
                />
              )}
            </Panel>

            <Panel className="p-6">
              <PanelHeader title="Internal checks" />
              <div className="mt-6 space-y-3">
                <CheckLine
                  checked={Boolean(order.customerNameSnapshot)}
                  text="Customer name captured"
                />
                <CheckLine
                  checked={Boolean(order.customerPhoneSnapshot)}
                  text="Customer phone captured"
                />
                <CheckLine
                  checked={order.items.length > 0}
                  text="At least one item stored"
                />
                <CheckLine
                  checked={order.whatsappMessageLogs.length > 0}
                  text="Provider activity logged"
                />
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </AdminWorkspace>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  label: string;
  primary: string;
  secondary: string[];
}) {
  return (
    <div className="rounded-[14px] border border-[#e5e5e1] bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.12em] text-[#777] uppercase">
            {label}
          </p>
          <p className="mt-2 font-semibold text-[#111]">{primary}</p>
          {secondary.map((line) => (
            <p className="mt-1 text-sm leading-5 text-[#777]" key={line}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          emphasized
            ? "text-base font-semibold text-[#111]"
            : "text-sm text-[#777]"
        }
      >
        {label}
      </span>
      <span
        className={
          emphasized
            ? "text-xl font-semibold text-[#111]"
            : "text-sm font-semibold text-[#111]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function RouteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#ededeb] pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-[#777]">{label}</span>
      <span className="text-right font-semibold text-[#111]">{value}</span>
    </div>
  );
}

function LogMeta({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-[12px] border border-[#e5e5e1] bg-[#fafaf8] p-3">
      <p className="text-xs font-semibold tracking-[0.12em] text-[#777] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold break-words text-[#111]">
        {value || "Not recorded"}
      </p>
    </div>
  );
}

function CheckLine({ checked, text }: { checked: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          checked
            ? "flex size-7 items-center justify-center rounded-full bg-[#ddf5e7] text-[#23834b]"
            : "flex size-7 items-center justify-center rounded-full bg-[#fee5e7] text-[#c73645]"
        }
      >
        {checked ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <XCircle className="size-4" />
        )}
      </span>
      <span className="text-sm font-medium text-[#111]">{text}</span>
    </div>
  );
}

function EmptyAuditState({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-dashed border-[#d7d7d1] bg-[#fafaf8] p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#777]">
        <Icon className="size-5" />
      </span>
      <p className="text-sm leading-6 text-[#777]">{text}</p>
    </div>
  );
}
