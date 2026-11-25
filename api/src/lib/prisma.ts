import { PrismaClient } from "@prisma/client";

// Single shared client. Run `npm run prisma:generate` after installing.
export const prisma = new PrismaClient();
