"use client";

import { batchAssignUsernames } from "../../lib/utils/generateNickname";
import { useState } from "react";

export default function BatchPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          バッチ処理
        </h1>
        <div className="space-y-4 text-center text-gray-500">
          <p>この画面からの一括処理は無効化されています。<br/>必要な場合はAPI経由で実行してください。</p>
        </div>
      </div>
    </div>
  );
} 