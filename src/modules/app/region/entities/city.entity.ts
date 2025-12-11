import { Field, ObjectType } from '@nestjs/graphql';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CityStatusEnum } from '../enums/city-status.enum';
import { Country } from './country.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';

@Entity()
@ObjectType()
@GeneratePermissions()
export class City extends AppBaseEntity {
  @Column({ unique: true })
  @Field()
  arName: string;

  @Column({ unique: true })
  @Field()
  enName: string;

  @Column({ type: 'enum', enum: CityStatusEnum })
  @Field(() => CityStatusEnum)
  status: CityStatusEnum;

  @Column()
  countryId: string;

  @ManyToOne(() => Country, (country) => country.cities)
  country: Country;
}
