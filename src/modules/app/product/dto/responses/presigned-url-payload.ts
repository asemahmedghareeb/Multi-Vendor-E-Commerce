import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class PresignedUrlPayload {
  @Field()
  presignedUrl: string;

  @Field(() => ID)
  fileId: string;
}