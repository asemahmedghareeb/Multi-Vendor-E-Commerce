import { registerEnumType } from "@nestjs/graphql";
import { register } from "module";

export enum VendorStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

registerEnumType(VendorStatus, { name: 'VendorStatus' });