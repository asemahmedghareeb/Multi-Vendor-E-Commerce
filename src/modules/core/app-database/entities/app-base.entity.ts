import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimestampScalar } from 'src/common/scalars/timestamp.scalar';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Base entity with common fields for DB and GraphQL. */
@ObjectType()
export abstract class AppBaseEntity {
  /** Unique identifier (UUID). */
  @Field()
  @ApiProperty({ example: '15a92d91-a66f-4762-90c1-b2c08637223d' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Timestamp when created. */
  @Field(() => TimestampScalar)
  @ApiProperty({ example: '1756720307842' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /** Timestamp when last updated. */
  @Field(() => TimestampScalar)
  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ example: '1756720307842' })
  updatedAt: Date;

  /** Soft-delete timestamp (nullable). */
  @Field(() => TimestampScalar, { nullable: true })
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  static get permissionsTarget(): string {
    return this.name;
  }
}
