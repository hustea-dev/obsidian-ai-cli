import { GoogleGenAI } from "@google/genai";
import { AppMode } from './constants.ts';
import { ObsidianService } from '../services/ObsidianService.ts';
import { PromptLoader } from '../core/PromptLoader.ts';

export interface ObsidAXConfig {
    apiKey: string;
    vaultPath: string;
    inputData: string;
    mode: AppMode;
    date?: Date;
    instruction?: string;
    filePath?: string;
}

export interface ModeStrategy {
    execute(
        inputData: string,
        obsidian: ObsidianService,
        genAI: GoogleGenAI,
        promptLoader: PromptLoader,
        fileInfo: { relativePath: string; fullPath: string },
        instruction?: string
    ): Promise<any>;
}

export interface XPostCandidate {
    content: string;
    hashtags: string[];
}

export interface NoteData {
    date: Date;
    mode: AppMode;
    inputData: string;
}
