import { FileModelEnum } from '../enums/file-model.enum';
import { FileUseCaseEnum } from '../enums/file-use-case.enum';

export const FileModelUseCaseValidatorOptions: {
  [key in FileModelEnum]: FileUseCaseEnum[];
} = {
  public_test: [
    FileUseCaseEnum.VIDEO_TEST,
    FileUseCaseEnum.DOC_TEST,
    FileUseCaseEnum.IMAGE_TEST,
  ],
  product: [
    FileUseCaseEnum.PRODUCT_IMAGE,
  ],
};
