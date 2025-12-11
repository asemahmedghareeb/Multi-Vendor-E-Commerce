import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AgoraService } from '../services/agora.service';
import { GenerateAgoraRtcTokenInput } from '../dtos/inputs/generate-agora-rtc-tokent.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../../auth-base/user/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import { AgoraRtcTokenResponse } from '../dtos/responses/agora-rtc-token.response';
import { Auth } from 'src/common/decorators/auth.decorator';
import { AgoraUserResponse } from '../dtos/responses/agora-user-response.response';

@Resolver()
export class AgoraResolver {
  constructor(private readonly agoraService: AgoraService ) {}

  @Query(() => AgoraUserResponse)
  @Auth()
  getUserDataByAgoraUID(@Args('uid') uid: number) {
    return this.agoraService.getUserDataByAgoraUserId(uid);
  }

  @Mutation(() => AgoraRtcTokenResponse)
  @Transactional()
  @Auth()
  generateAgoraRtcToken(
    @Args() input: GenerateAgoraRtcTokenInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.agoraService.generateRtcToken(
      input.channelName,
      input.type,
        currentUser,
    );
  }
}
