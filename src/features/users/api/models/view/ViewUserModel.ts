export type ViewUserModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo?: {
    banDate: string;
    banReason: string;
    isBanned: boolean;
  };
};
