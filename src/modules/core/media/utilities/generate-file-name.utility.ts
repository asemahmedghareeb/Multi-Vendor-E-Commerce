import { FileUseCaseEnum } from '../enums/file-use-case.enum';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

// /[^a-zA-Z0-9\u0600-\u06FF_-]/g
// /.../g → The g flag means “global,” so it replaces all matches, not just the first one.
// ^ inside [] → Negation — means “anything NOT in this list.”
// a-z → lowercase English letters.
// A-Z → uppercase English letters.
// 0-9 → digits.
// \u0600-\u06FF → Unicode range for Arabic characters (basic Arabic block in Unicode).
// _ → underscore.
// - → hyphen.

export const generateFileName = (
  useCase: FileUseCaseEnum,
  filename: string,
) => {
  const { name, ext } = path.parse(filename);
  const sanitizedName = name.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '');
  return `${useCase}-${Date.now()}-${uuidv4()}-${sanitizedName}${ext}`;
};
