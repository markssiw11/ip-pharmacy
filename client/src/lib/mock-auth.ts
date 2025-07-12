// Mock authentication data and functions
export interface MockUser {
  id: number;
  username: string;
  role: string;
  fullName: string;
}

// Test accounts for login
export const mockUsers: MockUser[] = [
  {
    id: 1,
    username: "admin",
    role: "Quản trị viên",
    fullName: "Nguyễn Văn Admin",
  },
  {
    id: 2,
    username: "pharmacist",
    role: "Dược sĩ",
    fullName: "Trần Thị Dược",
  },
  {
    id: 3,
    username: "manager",
    role: "Quản lý",
    fullName: "Lê Văn Quản",
  },
];

// Test passwords (in real app, these would be hashed)
export const mockPasswords: Record<string, string> = {
  admin: "admin123",
  pharmacist: "duoc123",
  manager: "quan123",
};

export function authenticateUser(
  username: string,
  password: string
): MockUser | null {
  const user = mockUsers.find((u) => u.username === username);
  if (user && mockPasswords[username] === password) {
    return user;
  }
  return null;
}

export function changeUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): boolean {
  const user = mockUsers.find((u) => u.id === userId);
  if (user && mockPasswords[user.username] === currentPassword) {
    mockPasswords[user.username] = newPassword;
    return true;
  }
  return false;
}
