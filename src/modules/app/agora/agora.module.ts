import { Module } from '@nestjs/common';
import { AgoraService } from './services/agora.service';
import { AgoraResolver } from './resolvers/agora.resolver';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { ChannelMember } from './entities/channel-member.entity';

@Module({
  imports: [AppDatabaseModule.forFeature([ChannelMember])],
  providers: [AgoraService, AgoraResolver],
  exports: [],
})
export class AgoraModule {}
