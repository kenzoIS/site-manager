import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ApplicationStatus {
  PENDING = 'pending',
  DOCUMENT_REVIEW = 'document_review',
  DOCUMENTS_VALID = 'documents_valid',
  DOCUMENTS_REJECTED = 'documents_rejected',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  /** Facebook PSID of the applicant (used for Messenger notification on rejection) */
  @IsOptional()
  @IsString()
  facebook_psid?: string;
}

export class FilterApplicationsDto {
  @IsOptional()
  @IsUUID()
  role_id?: string;

  @IsOptional()
  @IsUUID()
  campaign_id?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

export class RejectDocumentsDto {
  @IsString()
  reason: string;

  /** Facebook PSID of the applicant to notify via Messenger */
  @IsOptional()
  @IsString()
  facebook_psid?: string;
}
