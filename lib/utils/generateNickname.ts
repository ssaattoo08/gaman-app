import { createClient } from "@/lib/supabase/client"

export const generateUniqueNickname = async (): Promise<string> => {
  const supabase = createClient()

  const foodNames = [
    "おにぎり", "たまご", "いちご", "ラーメン", "うどん",
    "プリン", "メロン", "ピザ", "カレー", "すし",
    "たこ焼き", "お好み焼き", "たまご焼き", "ぎょうざ", "シュウマイ",
    "エビチリ", "麻婆豆腐", "青椒肉絲", "回鍋肉", "酢豚",
    "天ぷら", "とんかつ", "エビフライ", "コロッケ", "メンチカツ",
    "ハンバーグ", "オムライス", "ドリア", "グラタン", "パスタ",
    "スパゲッティ", "カルボナーラ", "ペペロンチーノ", "ミートソース", "クリームソース",
    "ナポリタン", "焼きそば", "チャーハン", "天津飯", "エビチリ",
    "餃子", "春巻き", "焼売", "小籠包", "肉まん",
    "あんまん", "ピザまん", "カレーまん", "メロンパン", "あんパン",
    "クリームパン", "ジャムパン", "チョコパン", "食パン", "フランスパン",
    "ベーグル", "クロワッサン", "ドーナツ", "ケーキ", "チョコレート",
    "アイスクリーム", "かき氷", "みつ豆", "あんみつ", "わらび餅",
    "大福", "団子", "おはぎ", "まんじゅう", "ようかん",
    "羊羹", "水羊羹", "練り切り", "きんとん", "栗きんとん",
    "茶碗蒸し", "卵焼き", "だし巻き", "厚焼き", "薄焼き",
    "たまごサンド", "ハムサンド", "ツナサンド", "野菜サンド", "フルーツサンド",
    "サンドイッチ", "ホットドッグ", "ハンバーガー", "チーズバーガー", "フィッシュバーガー",
    "フライドチキン", "からあげ", "唐揚げ", "竜田揚げ", "南蛮漬け",
    "酢の物", "和え物", "おひたし", "胡麻和え", "白和え",
    "ひじき", "切り干し大根", "高野豆腐", "がんもどき", "厚揚げ"
  ]

  let nickname = ""
  let isUnique = false

  while (!isUnique) {
    const food = foodNames[Math.floor(Math.random() * foodNames.length)]
    const number = Math.floor(1000 + Math.random() * 9000)
    nickname = `${food}${number}`

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .single()

    if (!data) {
      isUnique = true
    }
  }

  return nickname
}
