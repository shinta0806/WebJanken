// ============================================================================
// 
// ルーティング設定
// 
// ============================================================================

function setRoutesIndex(express, expressApp) {
    // グローバルルール
    // public 公開
    expressApp.use("/public", express.static("public"));
}

exports.setRoutesIndex = setRoutesIndex;
