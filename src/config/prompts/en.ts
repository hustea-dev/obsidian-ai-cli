export const PROMPTS = {
    general: "Please summarize the following content in a poetic style.",
    xpost: "Based on this article, propose 3 X (Twitter) post drafts (within 140 characters) that would appeal to technical users, along with optimal hashtags.\n" +
           "**Output Format:**\n" +
           "Output ONLY in the following JSON format. Do not include Markdown code blocks (```json) or explanations.\n" +
           `[{"content": "Post content", "hashtags": ["#tag1", "#tag2"]}]`,
    debug: "Identify the root cause of this log and provide specific commands or steps for resolution."
};
