import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { File } from '../entities/file.entity';
import { PresignedUrlService } from '../services/presigned-url.service';

@Resolver(() => File)
export class FileResolver {
  constructor(private readonly presignedUrlService: PresignedUrlService) {}

  //hash if u are not gonna use the presignedUrl approach
  @ResolveField()
  url(@Parent() file: File) {
    return this.presignedUrlService.getDownloadPresignedUrl(file);
  }
}
