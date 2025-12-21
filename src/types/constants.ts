// @ts-ignore
export const AppMode = {
    GENERAL: 'general',
    X_POST: 'xpost',
    DEBUG: 'debug'
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];
