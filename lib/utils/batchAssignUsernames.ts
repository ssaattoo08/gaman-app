import { batchAssignUsernames } from "./generateNickname.js";

async function main() {
  try {
    console.log("既存ユーザーへのusername一括付与を開始します...");
    await batchAssignUsernames();
    console.log("username一括付与が完了しました！");
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

main(); 