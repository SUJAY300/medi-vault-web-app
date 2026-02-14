const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@medivault.com" },
  })
  if (existing) {
    console.log("Demo admin already exists")
    return
  }
  // Hash for Admin@123 (must match auth-store demo admin)
  const hash = await bcrypt.hash("Admin@123", 10)
  await prisma.user.create({
    data: {
      email: "admin@medivault.com",
      passwordHash: hash,
      role: "Admin",
      fullName: "System Admin",
    },
  })
  console.log("Demo admin created: admin@medivault.com / Admin@123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
