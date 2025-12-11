import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { User } from '../../auth-base/user/entities/user.entity';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { ChannelMemberTypeEnum } from '../enums/channel-member-type.enum';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { ChannelMember } from '../entities/channel-member.entity';

@Injectable()
export class AgoraService {
  private appCertificate?: string;
  private appId?: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectAppRepository(ChannelMember)
    private readonly channelMemberRepository,
  ) {
    this.appCertificate = configService.get('AGORA_APP_CERTIFICATE');
    this.appId = configService.get('AGORA_APP_ID');
  }

  async generateRtcToken(
    channelName: string,
    type: ChannelMemberTypeEnum,
    currentUser: User,
  ) {
    if (!this.appId || !this.appCertificate)
      throw new AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED);

    const channelMember = await this.channelMemberRepository.createOne({
      type,
      userId: currentUser.id,
    });

    const expireTime = 4 * 3600 * 1000;

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      channelMember.uid,
      RtcRole.PUBLISHER,
      expireTime,
      expireTime,
    );

    const expireDate = new Date(Date.now() + expireTime);

    return {
      user: currentUser,
      token,
      expireDate,
      uid: channelMember.uid,
    };
  }

  async getUserDataByAgoraUserId(id: number) {
    const channelMember = await this.channelMemberRepository.findOneOrFail(
      {
        where: {
          uid: id,
        },
        relations: {
          user: true,
        },
      },
      ErrorCodeEnum.NOT_FOUND,
    );

    return {
      user: channelMember.user,
      uid: channelMember.uid,
      type: channelMember.type,
    };
  }
}
