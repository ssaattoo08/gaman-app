"use client"

import BottomNav from "@/components/BottomNav"

export default function NotificationsPage() {
  return (
    <>
      <main className="px-4 py-8 max-w-[40rem] mx-auto">
        <div className="text-center">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
            <div className="text-2xl font-bold text-white mb-4">
              通知機能
            </div>
            <div className="text-gray-400 text-lg">
              現在この機能は一時的にご利用いただけません
            </div>
            <div className="text-gray-500 text-sm mt-4">
              ご不便をおかけしますが、しばらくお待ちください
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
} 