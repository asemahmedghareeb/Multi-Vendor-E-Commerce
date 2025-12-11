import { AppBaseEntity } from 'src/modules/core/app-database/entities/app-base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class TestEntity extends AppBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  age: number;
}
