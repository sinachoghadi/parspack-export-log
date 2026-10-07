"use client";

import { useState } from "react";

import { DisconnectDialog } from "@/components/auth/disconnect-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import { useTokenSession } from "@/providers/token-session-provider";

export function ParspackConnectionControl() {
  const {
    clearToken,
    hasToken,
    isHydrated,
    openTokenChange,
  } = useTokenSession();
  const { toast } = useToast();
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  if (!isHydrated || !hasToken) {
    return null;
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      await clearToken();
      setIsConfirmingDisconnect(false);
      toast({ type: "info", message: "Disconnected from Parspack." });
    } catch {
      toast({
        type: "error",
        message: "Unable to disconnect from Parspack. Try again.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <>
      <div
        aria-label="Parspack connected"
        className="flex w-full flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-surface-secondary px-3 py-2 sm:w-auto sm:justify-start"
      >
        <div className="flex min-w-0 items-center gap-2 pr-1">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full bg-success shadow-[0_0_0_3px_var(--success-soft)]"
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold text-foreground">
              Parspack
            </p>
            <p className="text-[11px] text-success">Connected</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            className="h-8 px-2.5 text-xs"
            size="sm"
            variant="ghost"
            onClick={openTokenChange}
          >
            Change token
          </Button>
          <Button
            className="h-8 px-2.5 text-xs text-danger"
            size="sm"
            variant="ghost"
            onClick={() => setIsConfirmingDisconnect(true)}
          >
            Disconnect
          </Button>
        </div>
      </div>

      <DisconnectDialog
        isOpen={isConfirmingDisconnect}
        isPending={isDisconnecting}
        onCancel={() => setIsConfirmingDisconnect(false)}
        onConfirm={() => {
          void handleDisconnect();
        }}
      />
    </>
  );
}
