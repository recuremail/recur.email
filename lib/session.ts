import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { User } from "@prisma/client"

export async function getCurrentUser(): Promise<User|null> {
  const session = await getServerSession(authOptions)

  return session?.user as User
}
