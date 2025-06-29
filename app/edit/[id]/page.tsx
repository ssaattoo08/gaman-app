"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from '@/lib/supabase/client'

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params?.id ? String(params.id) : ""

  const [content, setContent] = useState("")

  // 投稿データを取得してフォームに反映
  useEffect(() => {
    const fetchPost = async () => {
      console.log("投稿ID:", postId)

      const { data, error } = await supabase
        .from("gaman_logs")
        .select("content")
        .eq("id", postId)
        .single()

      if (data) {
        console.log("投稿データ取得成功:", data)
        setContent(data.content)
      } else {
        console.error("投稿取得エラー:", error)
        alert("投稿が見つかりません")
        router.push("/")
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  // 投稿を更新
  const handleUpdate = async () => {
    console.log("更新処理スタート", { postId, content })

    const { error } = await supabase
      .from("gaman_logs")
      .update({ content })
      .eq("id", postId)

    if (error) {
      console.error("更新エラー:", error)
      alert("更新に失敗しました")
    } else {
      console.log("更新成功！")
      router.push("/")
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">投稿の編集</h1>
      <textarea
        className="w-full p-2 rounded bg-gray-800 text-white"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        保存する
      </button>
    </div>
  )
}
