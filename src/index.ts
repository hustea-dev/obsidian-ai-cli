import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import { ObsidAX } from './core/ObsidAX.ts';
import { AppMode } from './types/constants.ts';
import { TEXT } from './config/text.ts';

dotenv.config();

async function readStdin(): Promise<string> {
    if (process.stdin.isTTY) {
        return "";
    }
    
    const chunks: Buffer[] = [];
    try {
        for await (const chunk of process.stdin) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks).toString('utf-8');
    } catch (error) {
        return "";
    }
}

function validateMode(modeInput: string | undefined): AppMode {
    if (!modeInput) return AppMode.GENERAL;

    const validModes = Object.values(AppMode) as string[];
    if (validModes.includes(modeInput)) {
        return modeInput as AppMode;
    }

    console.error(`${TEXT.errors.invalidMode} '${modeInput}'`);
    console.error(`${TEXT.errors.availableModes}: ${validModes.join(', ')}`);
    process.exit(1);
}

(async () => {
    const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;

    if (!API_KEY || !VAULT_PATH) {
        console.error(TEXT.errors.envMissing);
        process.exit(1);
    }

    const args = process.argv.slice(2);
    
    const modeArg = args.find(arg => arg.startsWith('--mode='));
    const modeInput = modeArg ? modeArg.split('=')[1] : undefined;
    
    const fileArg = args.find(arg => arg.startsWith('--file='));
    let filePath = fileArg ? fileArg.split('=')[1] : undefined;
    
    const positionalArgs = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));

    if (!filePath && positionalArgs.length > 0) {
        filePath = positionalArgs[0];
    }

    const instructionArg = args.find(arg =>
        arg.startsWith('--instruction=') || 
        arg.startsWith('--inst=') || 
        arg.startsWith('-i=')
    );
    let instruction = instructionArg ? instructionArg.split('=')[1] : undefined;

    let inputData = "";

    if (filePath) {
        try {
            await fs.access(filePath);
            inputData = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            const textInput = filePath; // 元の文字列を保存
            filePath = undefined;

            const stdinData = await readStdin().catch(() => "");
            
            if (stdinData) {
                inputData = stdinData;
                if (!instruction) {
                    instruction = textInput;
                }
            } else {
                inputData = textInput;
                
                if (!instruction && positionalArgs.length >= 2) {
                    instruction = positionalArgs[1];
                }
            }
        }
    } else {
        inputData = await readStdin().catch(() => "");
    }

    const mode = validateMode(modeInput);

    const app = new ObsidAX({
        apiKey: API_KEY,
        vaultPath: VAULT_PATH,
        inputData,
        mode,
        instruction,
        filePath
    });

    await app.run().catch((e) => {
        console.error(TEXT.errors.executionError, e);
        process.exit(1);
    });
})();
