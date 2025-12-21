// @ts-ignore
import * as dotenv from 'dotenv';
// @ts-ignore
import * as fs from 'fs/promises';
// @ts-ignore
import { ObsidAX } from './core/ObsidAX.ts';
// @ts-ignore
import { AppMode } from './types/constants.ts';
// @ts-ignore
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

    const modeArg = process.argv.find(arg => arg.startsWith('--mode='));
    const modeInput = modeArg ? modeArg.split('=')[1] : undefined;
    
    const instructionArg = process.argv.find(arg => arg.startsWith('--instruction='));
    const instruction = instructionArg ? instructionArg.split('=')[1] : undefined;

    const fileArg = process.argv.find(arg => arg.startsWith('--file='));
    const filePath = fileArg ? fileArg.split('=')[1] : undefined;

    let inputData = "";
    if (filePath) {
        try {
            inputData = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            console.error(`${TEXT.errors.fileReadError} '${filePath}'`);
            process.exit(1);
        }
    } else {
        inputData = await readStdin().catch(() => "");
    }
    
    const mode = validateMode(modeInput);

    // @ts-ignore
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
