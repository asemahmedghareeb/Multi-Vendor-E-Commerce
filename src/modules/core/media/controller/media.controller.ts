import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MediaService } from '../services/media.service';
import { Transactional } from 'typeorm-transactional';
import { FileModelEnum } from '../enums/file-model.enum';
import { FileAuthGuard } from '../guards/file-auth.guard';
import { ApiBody, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LangEnum } from 'src/common/enums/lang.enum';
import { FileUseCaseEnum } from '../enums/file-use-case.enum';
import { File } from '../entities/file.entity';
import { MarkFileAsUploadedInput } from '../dtos/inputs/mark-file-as-uploaded.input';
import { FillValidationHookGuard } from '../guards/file-validation-hook.guard';

@Controller('media')
@ApiHeader({
  name: 'lang',
  description: 'Language header',
  required: true,
  schema: { type: 'string', enum: Object.values(LangEnum) },
})
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Patch('mark-file-as-uploaded')
  @Transactional()
  @UseGuards(FillValidationHookGuard)
  //hash if u are not gonna use the presignedUrl approach
  markFileAsUploaded(@Body() input: MarkFileAsUploadedInput) {
    return this.mediaService.markFileAsUploaded(input);
  }

  @Get('validate-file-access/:model')
  @UseGuards(FileAuthGuard)
  //hash if u are not gonna use the presignedUrl approach
  async authorizePresignedUrl(@Req() req: Request) {
    return true;
  }

  @Post('upload')
  @Transactional()
  @ApiHeader({
    name: 'use_case',
    description: 'file use-case for validation',
    required: true,
    schema: { type: 'string', enum: Object.values(FileUseCaseEnum) },
  })
  @ApiHeader({
    name: 'model',
    description: 'model for authorization',
    required: true,
    schema: { type: 'string', enum: Object.values(FileModelEnum) },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    description: 'Fetch a file',
    type: File,
  })
  //hash if u are gonna use the presignedUrl approach
  async upload(@Req() req: Request) {
    return await this.mediaService.uploadFile(req);
  }

  @Get(':model/:fileName')
  @UseGuards(FileAuthGuard)
  //hash if u are gonna use the presignedUrl approach
  async streamFile(
    @Param('model') model: FileModelEnum,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    return this.mediaService.streamFile(model, fileName, res);
  }
}
