import * as path from 'path';
import { GoogleGenAI } from "@google/genai";
import { AppMode } from '../types/constants.ts';
import type { ModeStrategy, ObsidAXConfig } from '../types/interfaces.ts';
import { ObsidianService } from './ObsidianService.ts';
import { createNoteContent } from "../templates/obsidianNote.ts";
import { DebugStrategy } from "../strategies/DebugStrategy.ts";
import { GeneralStrategy } from "../strategies/GeneralStrategy.ts";
import { XPostStrategy } from "../strategies/XPostStrategy.ts";
import { TEXT } from '../config/text.ts';

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
        let fullPath = "";

        // Generalモード以外の場合のみ、Obsidianにノートを作成する
        if (mode !== AppMode.GENERAL) {
            const frontmatter = createNoteContent({
                date: now,
                mode: mode,
                inputData: inputData
            })

            fullPath = await this.obsidian.createNote(relativePath, frontmatter);
            console.log(`\n${TEXT.logs.obsidianSaved}: ${fullPath}`);
        }

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
            { relativePath, fullPath }, // fullPathは空文字の可能性があるが、GeneralStrategyでは使われないのでOK
            this.config.instruction
        );
        
        return { filePath: fullPath, ...result };
    }
}
