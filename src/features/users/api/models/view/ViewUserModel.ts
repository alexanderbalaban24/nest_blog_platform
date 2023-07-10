export type ViewUserModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    banDate: Date;
    banReason: string;
    isBanned: boolean;
  };
};
