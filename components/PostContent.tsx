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
      {/* 本文（URL非表示） */}
      <div className="whitespace-pre-line break-words">
        {removeUrls(content)}
      </div>
      {/* OGPカードや画像リンクは従来通り表示 */}
      {ogps.map(ogp => {
        // descriptionがエラーっぽい場合は非表示
        const isErrorDesc = ogp.description && /access denied|reference/i.test(ogp.description);
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
            <div className="font-bold text-white text-sm mb-1 text-center">{ogp.title}</div>
          </a>
        );
      })}
    </div>
  );
} 