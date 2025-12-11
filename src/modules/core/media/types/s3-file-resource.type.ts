import { PassThrough } from 'stream';
import { Readable } from 'typeorm/platform/PlatformTools';

export type S3FileResource = {
  readStream: Readable;
  key: string;
  passThrough: PassThrough;
};
