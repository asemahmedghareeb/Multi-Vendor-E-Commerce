import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { FileUseCaseEnum } from '../enums/file-use-case.enum';
import { FileModelEnum } from '../enums/file-model.enum';
import { AppBaseEntity } from '../../app-database/entities/app-base.entity';
import { Product } from 'src/modules/app/product/entities/product.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';


@Entity('files')
@ObjectType()
@GeneratePermissions()
export class File extends AppBaseEntity {
  @ApiProperty({
    example:
      'video_test-1756714286342-50104a6b-4ca0-4fdc-9a3f-10bfed759d77-855289-hd_1920_1080_25fps.mp4',
  })
  @Column()
  @Field()
  @Index()
  fileName: string;

  @ApiProperty({ example: 'video/mp4' })
  @Column()
  @Field()
  mimeType: string;

  @ApiProperty({ example: 9218257 })
  @Column()
  @Field()
  sizeInBytes: number;

  @ApiProperty({ example: false })
  @Column({ default: false })
  @Field()
  hasReference: boolean;

  @ApiProperty({ enum: FileModelEnum, example: FileModelEnum.PUBLIC_TEST })
  @Column({ type: 'enum', enum: FileModelEnum })
  @Field(() => FileModelEnum)
  fileModel: FileModelEnum;

  @ApiProperty({ enum: FileUseCaseEnum, example: FileUseCaseEnum.VIDEO_TEST })
  @Column({ type: 'enum', enum: FileUseCaseEnum })
  @Field(() => FileUseCaseEnum)
  fileUseCase: FileUseCaseEnum;

  @Column({
    type: 'boolean',
    default: true,
  })
  @Field(() => Boolean)
  uploaded: boolean;


  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'productId' })
  product: Product;


  // todo make a resolve field with this
  @ApiProperty({
    example:
      '/media/public_test/video_test-1756714286342-50104a6b-4ca0-4fdc-9a3f-10bfed759d77-855289-hd_1920_1080_25fps.mp4',
  })
  @Field(() => String)
  get url(): string {
    return `/media/${this.fileModel}/${this.fileName}`;
  }
}
