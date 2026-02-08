export declare enum CompanyStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended"
}
export function mapCompanyStatusToUI(
  status: CompanyStatus
): 'active' | 'pending' | 'suspended' {
  switch (status) {
    case CompanyStatus.ACTIVE:
      return 'active';

    case CompanyStatus.PENDING:
      return 'pending';

    case CompanyStatus.SUSPENDED:
      return 'suspended';

    default:
      return 'pending';
  }
}
