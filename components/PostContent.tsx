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
    <div>
      <div className="text-base whitespace-pre-line break-words mb-2">
        <Linkify options={{
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-blue-400 underline break-all"
        }}>{content}</Linkify>
      </div>
      {ogps.map(ogp => {
        // エラーっぽいdescriptionやtitleは非表示
        const isError =
          (ogp.description && /access denied|reference/i.test(ogp.description)) ||
          (ogp.title && /access denied|reference/i.test(ogp.title));
        return (
          <a
            key={ogp.url}
            href={ogp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-700 rounded-xl p-3 mb-2 bg-gray-900 hover:bg-gray-800 transition"
            style={{ maxWidth: 400 }}
          >
            {ogp.image
              ? (
                <img src={ogp.image} alt={ogp.title} className="w-full h-40 object-cover rounded-md mb-2" style={{ maxHeight: 160 }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(ogp.url)}`; }} />
              )
              : (
                <img src={`https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(ogp.url)}`}
                     alt="favicon"
                     className="w-16 h-16 object-contain rounded-md mb-2 mx-auto"
                     onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/noimage.png'; }}
                />
              )
            }
            <div className="font-bold text-white text-sm mb-1">{!isError && ogp.title}</div>
            <div className="text-xs text-gray-400 mb-1">{!isError && ogp.description}</div>
          </a>
        );
      })}
    </div>
  );
} 