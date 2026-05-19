"use client";

import { useEffect, useState } from "react";
import { APP_NAME, APP_TAGLINE, COPY } from "@/lib/gantt/constants";
import { prefersDownloadExport } from "@/lib/gantt/device";
import { DownloadIcon, ShareIcon } from "./icons";

interface HeaderProps {
  onShare: () => void;
  sharing: boolean;
}

export function Header({ onShare, sharing }: HeaderProps) {
  const [isDownload, setIsDownload] = useState(true);

  useEffect(() => {
    setIsDownload(prefersDownloadExport());
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setIsDownload(prefersDownloadExport());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <h1>{APP_NAME}</h1>
        <div className="subtitle">{APP_TAGLINE}</div>
      </div>
      <button
        type="button"
        className="btn-download"
        onClick={onShare}
        disabled={sharing}
      >
        {sharing ? (
          "處理中…"
        ) : (
          <>
            {isDownload ? <DownloadIcon /> : <ShareIcon />}
            {isDownload ? COPY.exportDownload : COPY.exportShare}
          </>
        )}
      </button>
    </div>
  );
}
