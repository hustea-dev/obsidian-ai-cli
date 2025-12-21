// @ts-ignore
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import { ObsidianService } from '../core/ObsidianService.ts';
// @ts-ignore
import type { ModeStrategy } from '../types/interfaces.ts';
// @ts-ignore
import { AppMode } from '../types/constants.ts';
// @ts-ignore
import { TEXT } from '../config/text.ts';

// @ts-ignore
export abstract class BaseStrategy implements ModeStrategy {
    protected abstract mode: AppMode;
    protected abstract promptTemplate: string;

    async execute(
        inputData: string,
        obsidian: ObsidianService,
        genAI: GoogleGenAI,
        fileInfo: { relativePath: string; fullPath: string },
        instruction?: string
    ): Promise<any> {
        
        const context = await this.prepareContext(inputData, obsidian, fileInfo);
        const responseText = await this.analyze(context, genAI, instruction);

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

    protected async analyze(context: string, genAI: GoogleGenAI, instruction?: string): Promise<string> {
        console.log(`${TEXT.logs.geminiAnalyzing} (${this.mode} ${TEXT.logs.modeSuffix})...`);

        let promptText = `${this.promptTemplate}\n\n`;
        
        if (instruction) {
            promptText += `${TEXT.prompts.additionalInstruction}:\n${instruction}\n\n`;
        }

        promptText += `${TEXT.prompts.targetData}:\n${context}`;

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
