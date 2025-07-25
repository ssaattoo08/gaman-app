import React from "react";
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

function extractUrls(text: string): string[] {
  return Array.from(text.matchAll(/https?:\/\/[^\s]+/g)).map(m => m[0]);
}

function removeUrls(text: string) {
  return text.replace(/https?:\/\/[^\s]+/g, "");
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function PostContent({ content, url_title }: { content: string, url_title?: string }) {
  const urls = extractUrls(content);
  return (
    <div>
      {/* 本文（URL除外） */}
      <div className="whitespace-pre-line break-words mb-2">
        {removeUrls(content)}
      </div>
      {/* カード風リンク（X風） */}
      {urls.map(url => (
        <div
          key={url}
          className="my-2 p-3 rounded-lg bg-gray-800 border border-gray-600 max-w-xl overflow-x-auto"
          style={{wordBreak: 'break-all'}}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:underline"
            style={{overflowWrap: 'anywhere'}}
          >
            <div className="flex items-center mb-1 min-w-0">
              <span className="inline-block mr-2">🔗</span>
              <span className="text-blue-300 font-semibold text-base truncate block min-w-0" style={{maxWidth: '100%'}}>
                {url_title ? url_title : getDomain(url)}
              </span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
} 