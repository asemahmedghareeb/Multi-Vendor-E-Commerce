import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PresignedUrlService } from '../services/presigned-url.service';
import { PresignedUrlResponse } from '../dtos/responses/presigned-url.response';
import { Transactional } from 'typeorm-transactional';
import { GeneratePresignedUrlInput } from '../dtos/inputs/generate-presigned-url.input';

@Resolver()
export class PresignedUrlResolver {
  constructor(private readonly presignedUrlService: PresignedUrlService) {}

  @Mutation(() => PresignedUrlResponse)
  @Transactional()
  getUploadPresignedUrl(@Args('input') input: GeneratePresignedUrlInput) {
    return this.presignedUrlService.getUploadPresignedUrl(input);
  }
}
