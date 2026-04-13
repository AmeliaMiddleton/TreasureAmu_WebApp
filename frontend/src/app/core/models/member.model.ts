export type MemberType = 'personal' | 'business' | 'nonprofit';
export type SignupType = 'member' | 'newsletter';

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  memberType: MemberType;
  signupType: SignupType;
  zipCode: string;
  phone?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  memberId?: string;
}

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  personal:   'Personal',
  business:   'Business',
  nonprofit:  'Non-Profit Organization',
};
