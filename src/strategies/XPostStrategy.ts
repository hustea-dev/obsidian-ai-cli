// @ts-ignore
import { ObsidianService } from '../core/ObsidianService.ts';
// @ts-ignore
import { TEXT } from '../config/text.ts';
// @ts-ignore
import { AppMode } from '../types/constants.ts';
// @ts-ignore
import { BaseStrategy } from './BaseStrategy.ts';
// @ts-ignore
import { XService } from '../core/XService.ts';
// @ts-ignore
import { select, confirm } from '@inquirer/prompts';
// @ts-ignore
import type { XPostCandidate } from '../types/interfaces.ts';

// @ts-ignore
export class XPostStrategy extends BaseStrategy {
    protected mode = AppMode.X_POST;
    protected promptTemplate = TEXT.prompts.xPost;

    protected override async prepareContext(
        inputData: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<string> {
        return await obsidian.readContextNote(fileInfo.relativePath);
    }

    protected override async processResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<void> {
        await obsidian.appendAnalysisResult(fileInfo.relativePath, responseText, this.mode);

        let candidates: XPostCandidate[] = [];
        try {
            const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
            candidates = JSON.parse(cleanJson);
        } catch (e) {
            console.error(TEXT.errors.jsonParseFailed);
            return;
        }

        if (!Array.isArray(candidates) || candidates.length === 0) {
            console.error(TEXT.errors.noCandidates);
            return;
        }

        if (!process.stdin.isTTY) {
             console.warn(TEXT.errors.notTTY);
             return;
        }

        console.log(`\n${TEXT.logs.xPostStart}`);

        const selectedPost = await select({
            message: TEXT.ui.selectPost,
            choices: candidates.map((c, index) => ({
                name: `${index + 1}. ${c.content.substring(0, 50)}... (${c.hashtags.join(' ')})`,
                value: c,
                description: c.content
            })),
        });

        const fullPostContent = `${selectedPost.content}\n\n${selectedPost.hashtags.join(" ")}`;

        console.log(`\n${TEXT.logs.xPostSelected}`);
        console.log("--------------------------------------------------");
        console.log(fullPostContent);
        console.log("--------------------------------------------------");

        const isConfirmed = await confirm({
            message: TEXT.ui.confirmPost,
            default: false
        });

        if (isConfirmed) {
            try {
                const xService = new XService();
                const result = await xService.postTweet(fullPostContent);
                
                console.log(`\n${TEXT.logs.xPostSuccess} (ID: ${result.id})`);
                
                await obsidian.appendNote(fileInfo.relativePath, `\n\n${TEXT.markdown.xPostSuccessHeader}\nTweet ID: ${result.id}\n\n${fullPostContent}\n`);
            } catch (e: any) {
                console.error(`\n${TEXT.errors.xPostFailed} ${e.message}`);
                await obsidian.appendNote(fileInfo.relativePath, `\n\n${TEXT.markdown.xPostFailHeader}\nError: ${e.message}\n`);
            }
        } else {
            console.log(`\n${TEXT.logs.xPostCancel}`);
        }
    }
}
