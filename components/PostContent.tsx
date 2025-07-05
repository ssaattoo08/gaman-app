import React, { useEffect, useState } from "react";
import Linkify from "linkify-react";

// OGPカード用の型
interface OgpData {
  url: string;
  title: string;
  description: string;
  image: string;
}

const fetchOgp = async (url: string): Promise<OgpData | null> => {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    if (json.status === "success") {
      return {
        url: json.data.url,
        title: json.data.title,
        description: json.data.description,
        image: json.data.image?.url || "",
      };
    }
    return null;
  } catch {
    return null;
  }
};

const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![^<]*>|[^\[]*\])/g;

function removeUrls(text: string) {
  return text.replace(/https?:\/\/[^\s]+/g, "");
}

export default function PostContent({ content }: { content: string }) {
  const [ogps, setOgps] = useState<OgpData[]>([]);

  // OGPカード用に本文からURLを抽出
  const urls = Array.from(content.matchAll(/https?:\/\/[^\s]+/g)).map(m => m[0]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(urls.map(url => fetchOgp(url))).then(results => {
      if (!cancelled) {
        setOgps(results.filter(Boolean) as OgpData[]);
      }
    });
    return () => { cancelled = true; };
  }, [urls]);

  return (
    <div>
      {/* 本文のみ表示（OGPカード・画像リンクは非表示） */}
      <div className="whitespace-pre-line break-words">
        {removeUrls(content)}
      </div>
    </div>
  );
} 