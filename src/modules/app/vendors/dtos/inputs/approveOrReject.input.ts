import { Field, InputType } from "@nestjs/graphql";
import { VendorStatus } from "../../enums/vendor-status.enum";
import { IsNotEmpty, IsUUID } from "class-validator";

@InputType()
export class ApproveOrRejectVendorInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  
  id: string;

  
  @Field()
  @IsNotEmpty()
  status: VendorStatus;
}