import React from "react";

export default function ProfileEditPage() {
  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">プロフィール編集</h2>
      <form>
        <label className="block mb-2 text-gray-300">
          ニックネーム
          <input type="text" className="w-full p-2 rounded bg-gray-800 text-white mt-1" />
        </label>
        <label className="block mb-4 text-gray-300">
          自己紹介
          <textarea className="w-full p-2 rounded bg-gray-800 text-white mt-1" rows={3} />
        </label>
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded font-bold w-full">
          保存
        </button>
      </form>
    </div>
  );
} 