import { z } from 'zod';

// プロンプトファイルの期待する構造
export const PromptFileSchema = z.object({
    // Frontmatter部分 (オプション)
    frontmatter: z.object({
        description: z.string().optional(),
        version: z.number().optional(),
        tags: z.array(z.string()).optional(),
    }).optional(),
    
    // 本文（これが実際のプロンプトになる）
    content: z.string().min(10, "プロンプトが短すぎます (10文字以上必要です)"),
});

export type PromptFile = z.infer<typeof PromptFileSchema>;
