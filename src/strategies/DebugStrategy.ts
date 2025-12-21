// @ts-ignore
import { ObsidianService } from '../core/ObsidianService.ts';
// @ts-ignore
import { TEXT } from '../config/text.ts';
// @ts-ignore
import { AppMode } from '../types/constants.ts';
// @ts-ignore
import { BaseStrategy } from './BaseStrategy.ts';

// @ts-ignore
export class DebugStrategy extends BaseStrategy {
    protected mode = AppMode.DEBUG;
    protected promptTemplate = TEXT.prompts.debug;

    protected override async processResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<void> {
        await obsidian.appendAnalysisResult(fileInfo.relativePath, responseText, this.mode);
    }
}
