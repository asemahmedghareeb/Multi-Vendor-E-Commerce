import * as fs from 'fs';
import { Readable } from 'stream';

export type LocalFileResource = {
  writeStream: fs.WriteStream;
  readStream: Readable;
  filePath: string;
};
