import { Field, ObjectType } from '@nestjs/graphql';
import { File } from '../../entities/file.entity';

@ObjectType()
export class PresignedUrlResponse {
  @Field()
  presignedUrl: string;

  @Field(() => File)
  file: File;
}
