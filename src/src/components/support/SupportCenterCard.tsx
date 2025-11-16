import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Icon } from "../ui/Icon";
import { cn } from "../../lib/utils/cn";
import { SupportActionForm } from "./SupportActionForm";
import {
  SupportActionConfig,
  SupportActionId,
  SupportRequestLog,
} from "../../features/support/types";
import { supportActions } from "../../features/support/data";

const actionBadgeStyles: Record<SupportActionId, string> = {
  ticket: "bg-blue-50 text-blue-700",
  chat: "bg-emerald-50 text-emerald-700",
  meeting: "bg-amber-50 text-amber-700",
  "secure-room": "bg-purple-50 text-purple-700",
};

const initialLogs: SupportRequestLog[] = [
  {
    requestId: "SR-7421",
    actionId: "ticket",
    title: "تیکت کیفیت خط تولید",
    summary: "موضوع: افت فشار · اولویت: بالا",
    submittedAt: "امروز · ۰۸:۴۵",
  },
  {
    requestId: "SR-7415",
    actionId: "chat",
    title: "گفتگو با مهندس آماده‌باش",
    summary: "موضوع: قطع مقطعی برق",
    submittedAt: "دیروز · ۱۹:۱۰",
  },
  {
    requestId: "SR-7388",
    actionId: "meeting",
    title: "رزرو جلسه هم‌آهنگی QA",
    summary: "۳۰ دقیقه · سه‌شنبه",
    submittedAt: "دیروز · ۱۵:۲۰",
  },
];

const actionLookup = new Map<SupportActionId, SupportActionConfig>(
  supportActions.map((action) => [action.id, action])
);

export function SupportCenterCard({ className }: { className?: string }) {
  const [activeActionId, setActiveActionId] = useState<SupportActionId | null>(
    null
  );
  const [logs, setLogs] = useState<SupportRequestLog[]>(initialLogs);
  const [successNotice, setSuccessNotice] = useState<
    { requestId: string; title: string } | null
  >(null);

  const activeAction = useMemo(() => {
    if (!activeActionId) return null;
    return actionLookup.get(activeActionId) ?? null;
  }, [activeActionId]);

  useEffect(() => {
    if (!successNotice) return;

    const timeout = window.setTimeout(() => {
      setSuccessNotice(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [successNotice]);

  const handleSubmit = (payload: Record<string, string>) => {
    if (!activeAction) return;

    const requestId = `SR-${Date.now().toString().slice(-4)}`;
    const summaryParts = activeAction.fields
      .map((field) => {
        const rawValue = payload[field.id];
        if (!rawValue) return null;
        if (field.type === "select" && field.options?.length) {
          const option = field.options.find((item) => item.value === rawValue);
          return `${field.label}: ${option ? option.label : rawValue}`;
        }
        return `${field.label}: ${rawValue}`;
      })
      .filter(Boolean)
      .slice(0, 2) as string[];

    const submittedAt = new Date().toLocaleString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLogs((prev) =>
      [
        {
          requestId,
          actionId: activeAction.id,
          title: activeAction.title,
          summary: summaryParts.join(" · ") || activeAction.detail,
          submittedAt: `امروز · ${submittedAt}`,
        },
        ...prev,
      ].slice(0, 4)
    );

    setSuccessNotice({ requestId, title: activeAction.title });
  };

  const badgeForAction = (actionId: SupportActionId) => {
    const classes = actionBadgeStyles[actionId] || "bg-gray-50 text-gray-600";
    const actionTitle = actionLookup.get(actionId)?.title ?? "درخواست";
    return (
      <span
        className={cn(
          "text-[11px] px-2 py-0.5 rounded-full font-medium",
          classes
        )}
      >
        {actionTitle}
      </span>
    );
  };

  return (
    <>
      <Card className={cn("p-6 space-y-4", className)}>
        <div className="flex flex-row-reverse items-center justify-between">
          <div className="text-right">
            <h4 className="text-base font-semibold text-gray-900">
              پشتیبانی و سرویس
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              تیم موفقیت مشتری همیشه آماده است
            </p>
          </div>
          <Button variant="secondary" size="sm">
            مشاهده درخواست‌ها
          </Button>
        </div>

        {successNotice && (
          <div className="flex flex-row-reverse items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700 text-xs">
            <Icon name="check" size={16} className="text-emerald-500" />
            <span>
              درخواست {successNotice.requestId} برای «{successNotice.title}» ثبت شد.
            </span>
          </div>
        )}

        <div className="space-y-3">
          {supportActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => setActiveActionId(action.id)}
              className="w-full text-right rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 flex items-center justify-between flex-row-reverse hover:bg-gray-50 transition"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{action.detail}</p>
                {action.sla && (
                  <span className="text-[11px] text-gray-400">
                    {action.sla}
                  </span>
                )}
              </div>
              <Icon
                name="chevronDown"
                size={18}
                className="text-gray-400 rotate-90"
              />
            </button>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex flex-row-reverse items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">آخرین درخواست‌ها</p>
            <span className="text-[11px] text-gray-500">
              همگام‌سازی خودکار هر ۵ دقیقه
            </span>
          </div>
          <ul className="space-y-2">
            {logs.map((log) => (
              <li
                key={log.requestId}
                className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3 flex flex-row-reverse items-start justify-between gap-3"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {log.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{log.summary}</p>
                </div>
                <div className="text-left text-xs text-gray-500">
                  {badgeForAction(log.actionId)}
                  <p className="mt-1 text-[11px]">{log.submittedAt}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Dialog
        isOpen={Boolean(activeAction)}
        onClose={() => setActiveActionId(null)}
        title={activeAction?.title}
      >
        {activeAction && (
          <SupportActionForm
            action={activeAction}
            onSubmit={handleSubmit}
            onClose={() => setActiveActionId(null)}
          />
        )}
      </Dialog>
    </>
  );
}
