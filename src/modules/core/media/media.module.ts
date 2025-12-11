import { Module } from '@nestjs/common';
import { UploaderLocalStrategy } from './strategies/local/local.strategy';
import { MediaService } from './services/media.service';
import { AppDatabaseModule } from '../app-database/app-database.module';
import { File } from './entities/file.entity';
import { UploaderValidationService } from './services/file-validation.service';
import { MediaController } from './controller/media.controller';
import { RemoveUnreferencedFilesCron } from './crons/remove-unreferenced-files.cron';
import { UploaderS3Strategy } from './strategies/s3/s3.strategy';
import { TestFileAuthGuard } from './guards/file-model-guards/test-file-auth.strategy';
import { FileAuthGuard } from './guards/file-auth.guard';
import { PresignedUrlService } from './services/presigned-url.service';
import { PresignedUrlResolver } from './resolvers/presigned-url.resolver';
import { FillValidationHookGuard } from './guards/file-validation-hook.guard';
import { FileResolver } from './resolvers/file.resolver';

@Module({
  imports: [AppDatabaseModule.forFeature([File])],
  providers: [
    UploaderLocalStrategy,
    UploaderS3Strategy,
    MediaService,
    UploaderValidationService,
    RemoveUnreferencedFilesCron,
    FileAuthGuard,
    TestFileAuthGuard,
    PresignedUrlService,
    PresignedUrlResolver,
    FillValidationHookGuard,
    FileResolver,
  ],
  exports: [],
  controllers: [MediaController],
})
export class MediaModule {}
