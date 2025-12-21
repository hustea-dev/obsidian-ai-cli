// @ts-ignore
export const TEXT = {
    prompts: {
        general:
            "以下の内容を要約し、重要ポイントを箇条書きで抽出してください。",

        xPost:
            "この記事を元に、技術系ユーザーに刺さるX投稿案（140文字以内）を3つ、最適なハッシュタグと共に提案してください。\n" +
            "**出力形式:**\n" +
            "以下のJSON形式のみで出力してください。Markdownのコードブロック（```json）や説明文は含めないでください。\n" +
            `[{"content": "投稿本文", "hashtags": ["#tag1", "#tag2"]}]`,

        debug:
            "このログの根本原因を特定し、解決のための具体的なコマンドや手順を提示してください。",

        additionalInstruction: "追加の指示",
        targetData: "対象データ"
    },
    logs: {
        obsidianSaved: "📄 Obsidianに記録しました",
        geminiAnalyzing: "🤖 Geminiが解析中",
        modeSuffix: "モード", // 追加
        analysisResult: "✨ 解析結果",
        obsidianAppended: "✅ 解析結果をファイルに追記しました",
        readingFromObsidian: "📂 Obsidianからノートを読み込んでいます",
        stdinReading: "⏳ 標準入力を読み込み中...",
        appRun: "🏃 app.run() を実行します...",
        completed: "✅ 完了しました",
        xPostStart: "🚀 X投稿モードを開始します...",
        xPostSelected: "📝 選択された投稿内容:",
        xPostSuccess: "✅ Xに投稿しました！",
        xPostCancel: "❌ 投稿をキャンセルしました。"
    },
    errors: {
        noInput: "パイプ経由で入力データが渡されていません。",
        geminiApi: "❌ Gemini API エラー:",
        envMissing: "❌ エラー: GOOGLE_API_KEY または OBSIDIAN_VAULT_PATH が設定されていません。",
        invalidMode: "❌ エラー: 無効なモード",
        availableModes: "ℹ️  使用可能なモード",
        executionError: "❌ 実行エラー:",
        analysisFailed: "解析結果を取得できませんでした。",
        jsonParseFailed: "⚠️ Geminiの回答をJSONとしてパースできませんでした。対話モードをスキップします。",
        noCandidates: "⚠️ 有効な投稿候補が見つかりませんでした。",
        notTTY: "⚠️ 標準入力がTTYではありません。対話モードを利用するには --file オプションを使用してください。",
        xAuthMissing: "❌ X APIの認証情報が .env に設定されていません。",
        xPostFailed: "❌ 投稿に失敗しました:",
        fileReadError: "❌ エラー: ファイルを読み込めませんでした:"
    },
    markdown: {
        originalDataHeader: "## 📥 原文データ",
        analysisHeader: "## 🧠 Gemini 解析結果",
        xPostSuccessHeader: "## 🚀 X投稿完了",
        xPostFailHeader: "## ❌ X投稿失敗"
    },
    ui: {
        selectPost: "投稿する案を選択してください:",
        confirmPost: "この内容でXに投稿しますか？"
    }
};
