export type Transaction = {
  userId: string;
  transactionId: string;
  dateTime: string;
  courseId: string;
  paymentProvider: "stripe";
  amount?: number;
  createdAt?: string;
  updatedAt?: string;
};
