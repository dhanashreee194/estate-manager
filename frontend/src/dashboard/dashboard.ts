export interface AdminDashboardData {
  sales: {
    total: number;
    received: number;
    pending: number;
  };
  expenses: {
    total: number;
  };
  profit: number;
  stats: {
    projects: string;
    unitsSold: string;
  };
  activities?: {
    type: "project" | "payment" | "user" | "expense";
    message: string;
    time: string;
  }[];
}
