import { TEXT } from '../config/text.ts';
import type {NoteData} from '../types/interfaces.ts';

export const createNoteContent = (data: NoteData): string => {
    return `---
date: ${data.date.toLocaleString()}
mode: ${data.mode}
tags: ["ai/output", "terminal/pipe"]
---

${TEXT.markdown.originalDataHeader}
\`\`\`text
${data.inputData}
\`\`\`

---
`;
};
