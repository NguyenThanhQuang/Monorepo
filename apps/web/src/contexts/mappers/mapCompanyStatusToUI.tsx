import type { CompanyStatus } from '@obtp/shared-types';

export function mapCompanyStatusToUI(
  status: CompanyStatus
): 'active' | 'pending' | 'suspended' {
  switch (status) {
    case 'active':
      return 'active';
    case 'pending':
      return 'pending';
    case 'suspended':
      return 'suspended';
    default:
      return 'pending';
  }
}
