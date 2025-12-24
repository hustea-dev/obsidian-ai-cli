import { ObsidianService } from '../services/ObsidianService.ts';
import { TEXT } from '../config/text.ts';
import { AppMode } from '../types/constants.ts';
import { BaseStrategy } from './BaseStrategy.ts';
import { XService } from '../services/XService.ts';
import type { XPostCandidate } from '../types/interfaces.ts';

export class XPostStrategy extends BaseStrategy {
    protected mode = AppMode.X_POST;
    protected promptTemplate = TEXT.prompts.xpost;

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

        if (!this.ui.isInteractive()) {
             console.warn(TEXT.errors.notTTY);
             return;
        }

        console.log(`\n${TEXT.logs.xPostStart}`);

        const selectedPost = await this.ui.askSelect(
            TEXT.ui.selectPost,
            candidates.map((c, index) => ({
                name: `${index + 1}. ${c.content.substring(0, 50)}... (${c.hashtags.join(' ')})`,
                value: c,
                description: c.content
            }))
        );

        const fullPostContent = `${selectedPost.content}\n\n${selectedPost.hashtags.join(" ")}`;

        console.log(`\n${TEXT.logs.xPostSelected}`);
        console.log("--------------------------------------------------");
        console.log(fullPostContent);
        console.log("--------------------------------------------------");

        const isConfirmed = await this.ui.askConfirm(TEXT.ui.confirmPost, false);

        if (isConfirmed) {
            try {
                const xService = this.createXService();
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

    protected createXService(): XService {
        return new XService();
    }
}
