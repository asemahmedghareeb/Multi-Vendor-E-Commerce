import { Module } from '@nestjs/common';
import { AppContactsService } from './services/app-contacts.service';
import { FAQService } from './services/faq.service';
import { FAQResolver } from './resolvers/faq.resolver';
import { AppDatabaseModule } from 'src/modules/core/app-database/app-database.module';
import { FAQ } from './entities/faq.entity';
import { AppContact } from './entities/app-contact.entity';
import { AppContactsResolver } from './resolvers/app-contacts.resolver';
import { Policy } from './entities/policy.entity';
import { PolicyService } from './services/policy.service';
import { PolicyResolver } from './resolvers/policy.resolver';

@Module({
  imports: [AppDatabaseModule.forFeature([AppContact, Policy, FAQ])],
  providers: [
    AppContactsService,
    FAQService,
    PolicyService,
    FAQResolver,
    AppContactsResolver,
    PolicyResolver,
  ],
  exports: [],
})
export class ContentModule {}
