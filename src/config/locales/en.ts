// @ts-ignore
export const TEXT = {
    prompts: {
        general: "Please summarize the following content and extract key points in bullet points.",
        xPost: "Based on this article, propose 3 X (Twitter) post drafts (within 140 characters) that would appeal to technical users, along with optimal hashtags.\n" +
               "**Output Format:**\n" +
               "Output ONLY in the following JSON format. Do not include Markdown code blocks (```json) or explanations.\n" +
               `[{"content": "Post content", "hashtags": ["#tag1", "#tag2"]}]`,
        debug: "Identify the root cause of this log and provide specific commands or steps for resolution.",
        additionalInstruction: "Additional Instructions",
        targetData: "Target Data"
    },
    logs: {
        obsidianSaved: "📄 Saved to Obsidian",
        geminiAnalyzing: "🤖 Gemini is analyzing",
        modeSuffix: "mode", // 追加
        analysisResult: "✨ Analysis Result",
        obsidianAppended: "✅ Analysis result appended to file",
        readingFromObsidian: "📂 Reading note from Obsidian",
        stdinReading: "⏳ Reading standard input...",
        appRun: "🏃 Running app.run()...",
        completed: "✅ Completed",
        xPostStart: "🚀 Starting X post mode...",
        xPostSelected: "📝 Selected post content:",
        xPostSuccess: "✅ Posted to X!",
        xPostCancel: "❌ Post cancelled."
    },
    errors: {
        noInput: "No input data provided via pipe.",
        geminiApi: "❌ Gemini API Error:",
        envMissing: "❌ Error: GOOGLE_API_KEY or OBSIDIAN_VAULT_PATH is not set.",
        invalidMode: "❌ Error: Invalid mode",
        availableModes: "ℹ️  Available modes",
        executionError: "❌ Execution Error:",
        analysisFailed: "Failed to retrieve analysis result.",
        jsonParseFailed: "⚠️ Failed to parse Gemini response as JSON. Skipping interactive mode.",
        noCandidates: "⚠️ No valid post candidates found.",
        notTTY: "⚠️ Standard input is not a TTY. Use --file option for interactive mode.",
        xAuthMissing: "❌ X API credentials are not set in .env.",
        xPostFailed: "❌ Failed to post:",
        fileReadError: "❌ Error: Could not read file:"
    },
    markdown: {
        originalDataHeader: "## 📥 Original Data",
        analysisHeader: "## 🧠 Gemini Analysis Result",
        xPostSuccessHeader: "## 🚀 X Post Completed",
        xPostFailHeader: "## ❌ X Post Failed"
    },
    ui: {
        selectPost: "Select a post candidate:",
        confirmPost: "Post this content to X?"
    }
};
