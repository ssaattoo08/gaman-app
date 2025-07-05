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

function removeUrls(text: string) {
  return text.replace(/https?:\/\/[^\s]+/g, "");
}

export default function PostContent({ content }: { content: string }) {
  return (
    <div>
      {/* 本文＋URL自動リンク化 */}
      <div className="whitespace-pre-line break-words">
        <Linkify options={{ target: "_blank", rel: "noopener noreferrer" }}>
          {content}
        </Linkify>
      </div>
    </div>
  );
} 