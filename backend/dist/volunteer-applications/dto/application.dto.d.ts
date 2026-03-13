export declare enum ApplicationStatus {
    PENDING = "pending",
    DOCUMENT_REVIEW = "document_review",
    DOCUMENTS_VALID = "documents_valid",
    DOCUMENTS_REJECTED = "documents_rejected",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class UpdateStatusDto {
    status: ApplicationStatus;
    reason?: string;
}
export declare class FilterApplicationsDto {
    role_id?: string;
    campaign_id?: string;
    status?: ApplicationStatus;
    search?: string;
}
export declare class RejectDocumentsDto {
    reason: string;
}
