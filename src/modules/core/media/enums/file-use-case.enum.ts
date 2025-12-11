import { registerEnumType } from '@nestjs/graphql';

export enum FileUseCaseEnum {
  VIDEO_TEST = 'video_test',
  DOC_TEST = 'doc_test',
  IMAGE_TEST = 'image_test'
}

registerEnumType(FileUseCaseEnum, {
  name: 'UploadUseCaseEnum',
});
