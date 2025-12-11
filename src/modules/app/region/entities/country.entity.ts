import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratePermissions } from 'src/common/decorators/generate-entity-permissions.decorator';
import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CountryPermissionEnum } from '../enums/country-permission.enum';
import { City } from './city.entity';

@Entity()
@ObjectType()
@GeneratePermissions(CountryPermissionEnum)
export class Country extends AppBaseEntity {
  @Column()
  @Field()
  countryCode: string;

  @Column()
  @Field()
  enName: string;

  @Column()
  @Field()
  arName: string;

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
