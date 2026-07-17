export type TravelerSession = {
  userId: string;
  email: string;
  name: string;
};

export type OperatorSession = {
  userId: string;
  operatorId: string;
  businessName: string;
  email: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
};

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
};
