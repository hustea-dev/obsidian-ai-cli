// @ts-ignore
import { TEXT as JA } from './locales/ja.ts';
// @ts-ignore
import { TEXT as EN } from './locales/en.ts';

const lang = process.env.APP_LANG || 'ja';

// @ts-ignore
export const TEXT = lang === 'en' ? EN : JA;
