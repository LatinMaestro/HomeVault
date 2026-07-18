"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { Share } from "@capacitor/share";

import { Button } from "@/components/ui/button";

export function NativeShareButton({
  title,
  path,
  description,
}: {
  title: string;
  path: string;
  description?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let active = true;

    void Share.canShare()
      .then(({ value }) => {
        if (active) setSupported(value);
      })
      .catch(() => {
        if (active) setSupported(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!supported) return null;

  async function shareRecord() {
    setSharing(true);
    try {
      await Share.share({
        title,
        text: description ?? `Open ${title} in HomeVault.`,
        url: new URL(path, window.location.origin).toString(),
        dialogTitle: "Share HomeVault record",
      });
    } catch {
      // Closing a platform share sheet is a normal non-destructive outcome.
    } finally {
      setSharing(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={shareRecord}
      disabled={sharing}
      aria-label={`Share ${title}`}
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      {sharing ? "Opening..." : "Share"}
    </Button>
  );
}
