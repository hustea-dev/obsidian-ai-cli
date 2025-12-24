import { select, confirm } from '@inquirer/prompts';
import { TEXT } from '../config/text.ts';

export class UserInteraction {
    /**
     * 対話モード（TTY）かどうかを判定する
     */
    isInteractive(): boolean {
        return process.stdin.isTTY;
    }

    /**
     * 確認プロンプトを表示する
     * @param message 表示するメッセージ
     * @param defaultResponse デフォルトの応答 (true: Yes, false: No)
     * @returns ユーザーの選択結果 (Yes: true, No: false)
     *          非対話モードの場合はエラーを投げるか、デフォルト値を返す制御が可能
     */
    async askConfirm(message: string, defaultResponse: boolean = false): Promise<boolean> {
        if (!this.isInteractive()) {
            console.warn(TEXT.errors.notTTY);
            return false;
        }

        return await confirm({
            message: message,
            default: defaultResponse
        });
    }

    /**
     * 選択プロンプトを表示する
     * @param message 表示するメッセージ
     * @param choices 選択肢のリスト
     * @returns 選択された値
     */
    async askSelect<T>(message: string, choices: { name: string; value: T; description?: string }[]): Promise<T> {
        if (!this.isInteractive()) {
            throw new Error(TEXT.errors.notTTY);
        }

        return await select({
            message: message,
            choices: choices
        });
    }

    /**
     * 警告メッセージを表示する
     * @param message メッセージ
     */
    warn(message: string): void {
        console.warn(`⚠️ ${message}`);
    }

    /**
     * エラーメッセージを表示する
     * @param message メッセージ
     */
    error(message: string): void {
        console.error(`❌ ${message}`);
    }

    /**
     * 情報メッセージを表示する
     * @param message メッセージ
     */
    info(message: string): void {
        console.log(`ℹ️  ${message}`);
    }
}
