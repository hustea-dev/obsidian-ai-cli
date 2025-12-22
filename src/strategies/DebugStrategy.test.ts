import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { DebugStrategy } from './DebugStrategy.ts';
import { ObsidianService } from '../core/ObsidianService.ts';
import { AppMode } from '../types/constants.ts';

// モックの定義
class MockObsidianService extends ObsidianService {
    constructor() { super('/tmp'); }
    
    // 呼び出し確認用のフラグとデータ
    appendCalled = false;
    lastAppendPath = "";
    lastAppendContent = "";
    lastAppendMode: AppMode | null = null;
    
    async appendAnalysisResult(relativePath: string, content: string, mode: AppMode) { 
        this.appendCalled = true;
        this.lastAppendPath = relativePath;
        this.lastAppendContent = content;
        this.lastAppendMode = mode;
        return; 
    }
}

class MockGenAI {
    async generateContent() {
        return {
            text: "Debug Analysis Result"
        };
    }
    models = {
        generateContent: this.generateContent
    }
}

describe('DebugStrategy', () => {
    // コンソールログの抑制
    const originalLog = console.log;
    const originalError = console.error;

    before(() => {
        console.log = () => {};
        console.error = () => {};
    });

    after(() => {
        console.log = originalLog;
        console.error = originalError;
    });

    it('should execute analysis AND append to Obsidian', async () => {
        const strategy = new DebugStrategy();
        const mockObsidian = new MockObsidianService();
        const mockGenAI = new MockGenAI() as any;

        const inputData = "Error log content";
        const fileInfo = { relativePath: "debug_log.md", fullPath: "/tmp/debug_log.md" };

        const result = await strategy.execute(
            inputData,
            mockObsidian,
            mockGenAI,
            fileInfo
        );

        // 1. Geminiからの応答が正しいか
        assert.strictEqual(result.responseText, "Debug Analysis Result");

        // 2. Obsidianへの追記メソッドが呼ばれたか
        assert.strictEqual(mockObsidian.appendCalled, true, "Should call appendAnalysisResult");
        
        // 3. 正しいパスとモードで呼ばれたか
        assert.strictEqual(mockObsidian.lastAppendPath, fileInfo.relativePath);
        assert.strictEqual(mockObsidian.lastAppendMode, AppMode.DEBUG);
        
        // 4. 内容が渡されているか
        assert.strictEqual(mockObsidian.lastAppendContent, "Debug Analysis Result");
    });
});
