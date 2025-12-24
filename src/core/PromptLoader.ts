import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import { PromptFileSchema } from '../types/schemas.ts';
import { DEFAULT_PROMPTS } from '../templates/defaultPrompt.ts';
import { TEXT } from '../config/text.ts';

export class PromptLoader {
    private vaultPath: string;
    private lang: string;

    constructor(vaultPath: string, lang: string) {
        this.vaultPath = vaultPath;
        this.lang = lang;
    }

    /**
     * プロンプトファイルを読み込む
     * @param promptName プロンプト名 (例: "general", "xpost")
     * @returns プロンプト本文
     */
    async load(promptName: string): Promise<string> {
        const filePath = path.join(this.vaultPath, '_AI_Prompts', 'prompts', this.lang, `${promptName}.md`);

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const { content, data } = matter(fileContent);

            const validated = PromptFileSchema.parse({
                frontmatter: data,
                content: content.trim()
            });
            return validated.content;

        } catch (error: any) {
            if (error.code === 'ENOENT') {
                const defaultContent = DEFAULT_PROMPTS[promptName];
                if (defaultContent) {
                    await this.createDefault(filePath, defaultContent);
                    const { content } = matter(defaultContent);
                    return content.trim();
                }
                throw new Error(`No default prompt found for: ${promptName}`);
            }
            
            if (error instanceof z.ZodError) {
                const contentError = error.issues.find(issue =>
                    issue.path.includes('content') && issue.code === 'too_small'
                );

                if (contentError) {
                    const errorMessage = TEXT.loader.loadErrorDetail.replace('{filePath}', filePath);
                    throw new Error(`${errorMessage}\n${TEXT.loader.reason}: ${TEXT.validation.promptTooShort}`);
                }
            }
            
            const errorMessage = TEXT.loader.loadErrorDetail.replace('{filePath}', filePath);
            throw new Error(`${errorMessage}\n${TEXT.loader.reason}: ${error.message}`);
        }
    }

    /**
     * デフォルトのプロンプトファイルを作成する
     */
    private async createDefault(filePath: string, fileContent: string): Promise<void> {
        try {
            const dirPath = path.dirname(filePath);
            await fs.mkdir(dirPath, { recursive: true });
            
            await fs.writeFile(filePath, fileContent, 'utf-8');
            
            const logMessage = TEXT.loader.createdDefaultFile.replace('{filePath}', filePath);
            console.log(`ℹ️  ${logMessage}`);
        } catch (e) {
            const errorMessage = TEXT.loader.createDefaultError.replace('{filePath}', filePath);
            console.error(`❌ ${errorMessage}`, e);
        }
    }
}
