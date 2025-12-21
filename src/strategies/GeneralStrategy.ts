// @ts-ignore
import { TEXT } from '../config/text.ts';
// @ts-ignore
import { AppMode } from '../types/constants.ts';
// @ts-ignore
import { BaseStrategy } from './BaseStrategy.ts';

// @ts-ignore
export class GeneralStrategy extends BaseStrategy {
    protected mode = AppMode.GENERAL;
    protected promptTemplate = TEXT.prompts.general;
}
