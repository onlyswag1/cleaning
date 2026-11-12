import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Создаем адаптер для PostgreSQL, передавая ему строку подключения
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

// Передаем адаптер в конструктор PrismaClient
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma