import { test, describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { GeneralStrategy } from './GeneralStrategy.ts';
import { ObsidianService } from '../services/ObsidianService.ts';
import { PromptLoader } from '../core/PromptLoader.ts';
import { AppMode } from '../types/constants.ts';

class MockObsidianService extends ObsidianService {
    constructor() { super('/tmp'); }
    appendCalled = false;
    
    async appendAnalysisResult() { 
        this.appendCalled = true;
        return; 
    }
    async readContextNote() { return "mock content"; }
}

class MockGenAI {
    async generateContent() {
        return {
            text: "Mock AI Response"
        };
    }
    models = {
        generateContent: this.generateContent
    }
}

describe('GeneralStrategy', () => {
    it('should execute analysis but NOT append to Obsidian', async () => {
        const strategy = new GeneralStrategy();
        const mockObsidian = new MockObsidianService();
        const mockGenAI = new MockGenAI() as any;
        
        // クラス継承ではなく、単純なオブジェクトとしてモックを作成
        const mockLoader = {
            load: async (name: string, defaultPrompt: string) => defaultPrompt
        } as unknown as PromptLoader;

        const originalLog = console.log;
        console.log = () => {};

        try {
            const result = await strategy.execute(
                "test input",
                mockObsidian,
                mockGenAI,
                mockLoader,
                { relativePath: "test.md", fullPath: "/tmp/test.md" }
            );

            assert.strictEqual(result.responseText, "Mock AI Response");

            assert.strictEqual(mockObsidian.appendCalled, false);
        } finally {
            console.log = originalLog;
        }
    });
});
