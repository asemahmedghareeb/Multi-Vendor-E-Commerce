import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { File } from '../entities/file.entity';
import { AppRepository } from '../../app-database/repositories/app.repository';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { In } from 'typeorm';

@Injectable()
export class FileReferenceService {
  constructor(
    @InjectAppRepository(File)
    private readonly fileRepository: AppRepository<File>,
  ) {}

  async setReference(fileId: string) {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
      },
    });

    if (!file) throw new InternalServerErrorException('file does not exist!');

    file.hasReference = true;

    return this.fileRepository.save(file);
  }

  async setFilesReference(fileIds: string[]) {
    const files = await this.fileRepository.find({
      where: {
        id: In(fileIds),
      },
    });

    if (files.length !== fileIds.length)
      throw new InternalServerErrorException('some files do not exist!');

    files.forEach((file) => {
      file.hasReference = true;
    });

    return this.fileRepository.save(files);
  }

  async unSetReference(fileId: string) {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
      },
    });

    if (!file) throw new InternalServerErrorException('file does not exist!');

    file.hasReference = false;

    return this.fileRepository.save(file);
  }

  async unSetFilesReference(fileIds: string[]) {
    const files = await this.fileRepository.find({
      where: {
        id: In(fileIds),
      },
    });

    if (files.length !== fileIds.length)
      throw new InternalServerErrorException('some files do not exist!');

    files.forEach((file) => {
      file.hasReference = false;
    });

    return this.fileRepository.save(files);
  }
}
