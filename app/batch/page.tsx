"use client";

import { batchAssignUsernames } from "../../lib/utils/generateNickname";
import { useState } from "react";

export default function BatchPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleBatchAssign = async () => {
    setIsRunning(true);
    setResult("処理中...");
    
    try {
      await batchAssignUsernames();
      setResult("✅ username一括付与が完了しました！");
    } catch (error) {
      setResult(`❌ エラーが発生しました: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          バッチ処理
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={handleBatchAssign}
            disabled={isRunning}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isRunning ? "処理中..." : "既存ユーザーにusernameを一括付与"}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 