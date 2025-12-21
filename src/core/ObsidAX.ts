// @ts-ignore
import * as path from 'path';
// @ts-ignore
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import { AppMode } from '../types/constants.ts';
// @ts-ignore
import type { ModeStrategy, ObsidAXConfig } from '../types/interfaces.ts';
// @ts-ignore
import { ObsidianService } from './ObsidianService.ts';
// @ts-ignore
import { createNoteContent } from "../templates/obsidianNote.ts";
// @ts-ignore
import { DebugStrategy } from "../strategies/DebugStrategy.ts";
// @ts-ignore
import { GeneralStrategy } from "../strategies/GeneralStrategy.ts";
// @ts-ignore
import { XPostStrategy } from "../strategies/XPostStrategy.ts";
// @ts-ignore
import { TEXT } from '../config/text.ts';

// @ts-ignore
export class ObsidAX {
    private genAI: GoogleGenAI;
    private config: ObsidAXConfig;
    private obsidian: ObsidianService;

    constructor(config: ObsidAXConfig) {
        this.config = config;
        this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
        this.obsidian = new ObsidianService(config.vaultPath);
    }

    async run() {
        const { inputData, mode } = this.config;
        const now = this.config.date || new Date();

        if (!inputData.trim()) {
            throw new Error(TEXT.errors.noInput);
        }

        const dateStr = now.toISOString().split('T')[0] || 'unknown-date';
        const timeStr = now.toTimeString().split(' ')[0]?.replace(/:/g, '') || '000000';

        const relativePath = path.join('Inbox', dateStr, `log_${timeStr}.md`);

        const frontmatter = createNoteContent({
            date: now,
            mode: mode,
            inputData: inputData
        })

        const fullPath = await this.obsidian.createNote(relativePath, frontmatter);
        console.log(`\n${TEXT.logs.obsidianSaved}: ${fullPath}`);

        let strategy: ModeStrategy;

        switch (mode) {
            case AppMode.X_POST:
                strategy = new XPostStrategy();
                break;
            case AppMode.DEBUG:
                strategy = new DebugStrategy();
                break;
            case AppMode.GENERAL:
            default:
                strategy = new GeneralStrategy();
                break;
        }
        
        const result = await strategy.execute(
            inputData,
            this.obsidian,
            this.genAI,
            { relativePath, fullPath },
            this.config.instruction
        );
        
        return { filePath: fullPath, ...result };
    }
}
