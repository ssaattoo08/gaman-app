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

  useEffect(() => {
    // 本文からURLを抽出
    const urls = Array.from(new Set((content.match(urlRegex) || [])));
    if (urls.length === 0) return;
    let cancelled = false;
    Promise.all(urls.map(url => fetchOgp(url))).then(results => {
      if (!cancelled) {
        setOgps(results.filter(Boolean) as OgpData[]);
      }
    });
    return () => { cancelled = true; };
  }, [content]);

  return (
    <div className="whitespace-pre-line break-words">
      {removeUrls(content)}
    </div>
  );
} 