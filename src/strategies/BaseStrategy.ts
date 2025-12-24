import { GoogleGenAI } from "@google/genai";
import { ObsidianService } from '../services/ObsidianService.ts';
import { UserInteraction } from '../services/UserInteraction.ts';
import { PromptLoader } from '../core/PromptLoader.ts';
import type { ModeStrategy } from '../types/interfaces.ts';
import { AppMode } from '../types/constants.ts';
import { TEXT } from '../config/text.ts';

export abstract class BaseStrategy implements ModeStrategy {
    protected abstract mode: AppMode;
    protected ui: UserInteraction;

    constructor() {
        this.ui = new UserInteraction();
    }

    async execute(
        inputData: string,
        obsidian: ObsidianService,
        genAI: GoogleGenAI,
        promptLoader: PromptLoader,
        fileInfo: { relativePath: string; fullPath: string },
        instruction?: string
    ): Promise<any> {
        
        const context = await this.prepareContext(inputData, obsidian, fileInfo);
        const prompt = await this.getPrompt(promptLoader);
        const responseText = await this.analyze(context, genAI, prompt, instruction);

        await this.processResult(responseText, obsidian, fileInfo);
        return { responseText };
    }

    protected async prepareContext(
        inputData: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<string> {
        return inputData;
    }

    protected async getPrompt(loader: PromptLoader): Promise<string> {
        try {
            return await loader.load(this.mode);
        } catch (e: any) {
            this.ui.warn(TEXT.loader.loadError);
            this.ui.warn(`${TEXT.loader.reason}: ${e.message}`);

            this.ui.error(TEXT.loader.aborting);
            process.exit(1);
        }
    }

    protected async analyze(context: string, genAI: GoogleGenAI, promptTemplate: string, instruction?: string): Promise<string> {
        console.log(`${TEXT.logs.geminiAnalyzing} (${this.mode} ${TEXT.logs.modeSuffix})...`);

        let promptText = `${promptTemplate}\n\n`;
        
        if (instruction) {
            promptText += `${TEXT.labels.additionalInstruction}:\n${instruction}\n\n`;
        }

        promptText += `${TEXT.labels.targetData}:\n${context}`;

        try {
            const result = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [{ text: promptText }]
                    }
                ]
            });

            const responseText = result.text || TEXT.errors.analysisFailed;
            console.log(`\n${TEXT.logs.analysisResult}:\n${responseText}`);
            
            return responseText;

        } catch (error) {
            console.error(TEXT.errors.geminiApi, error);
            throw error;
        }
    }

    protected async processResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<void> {
    }
}
