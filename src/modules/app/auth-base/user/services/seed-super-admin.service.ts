import { Injectable, Logger } from '@nestjs/common';
import { AppRepository } from 'src/modules/core/app-database/repositories/app.repository';
import { User } from '../entities/user.entity';
import { InjectAppRepository } from 'src/common/decorators/inject-app-repository.decorator';
import { AdminGroupService } from '../../admin-group/services/admin-group.service';
import { PermissionService } from '../../admin-group/services/permission.service';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { SuperAdminCredentials } from '../types/super-admin-credentials.type';
import { validateOrReject } from 'class-validator';
import { UserService } from './user.service';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { ManualRegisterWithPasswordInput } from '../../auth/dtos/inputs/manual-register-user-with-password.input';
import { Wallet } from 'src/modules/app/wallet/entities/wallet.entity';

@Injectable()
export class SeedSuperAdminService {
  constructor(
    @InjectAppRepository(User)
    private readonly userRepository: AppRepository<User>,
    @InjectAppRepository(Wallet)
    private readonly walletRepository: AppRepository<Wallet>,

    private readonly userService: UserService,
    private readonly adminGroupService: AdminGroupService,
    private readonly permissionService: PermissionService,
    private readonly configService: ConfigService,
  ) {}

  async seedSuperAdmin() {
    const permissions = await this.permissionService.seedPermissions();
    const permissionIds = permissions.map(({ id }) => id);

    const superAdminGroup =
      await this.adminGroupService.seedOrUpdateSuperAdminGroup(permissionIds);

    const superAdminCredentials = plainToInstance(SuperAdminCredentials, {
      superAdminEmail:
        this.configService.getOrThrow<string>('SUPER_ADMIN_EMAIL'),
      superAdminPassword: this.configService.getOrThrow<string>(
        'SUPER_ADMIN_PASSWORD',
      ),
    });
    try {
      await validateOrReject(superAdminCredentials);
    } catch (errors) {
      Logger.error(errors);
      throw new Error('Error while validating super admin credentials');
    }

    const existedSuperAdmin = await this.userRepository.findOne({
      where: {
        adminGroupId: superAdminGroup.id,
      },
    });
  
    if (!existedSuperAdmin) {
      const user = await this.userService.registerUser(
        {
          firstName: 'Super',
          lastName: 'Admin',
          email: superAdminCredentials.superAdminEmail,
          password: superAdminCredentials.superAdminPassword,
        } as ManualRegisterWithPasswordInput,
        UserRoleEnum.ADMIN,
        true,
        false,
        false,
        superAdminGroup.id,
      );

      const wallet = await this.walletRepository.save(
        this.walletRepository.create({
          user,
          balance: 0,
        }),
      );
      await this.userRepository.update(user.id, { walletId: wallet.id });
    }
  }

  async onApplicationBootstrap() {
    await this.seedSuperAdmin();
    Logger.log('SuperAdmin permissions are up to date', 'SeedSuperAdmin');
  }
}
