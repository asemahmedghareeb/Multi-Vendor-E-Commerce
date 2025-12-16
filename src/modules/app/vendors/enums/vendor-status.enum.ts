import { registerEnumType } from "@nestjs/graphql";

export enum VendorStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

registerEnumType(VendorStatus, { name: 'VendorStatus' });