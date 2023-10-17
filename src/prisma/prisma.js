const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function prismaConnect() {
  try {
    await prisma.$connect();
    console.info('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the application on database connection error
  }
}

prismaConnect()
  .catch((error) => {
    console.error('Error in main function:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = { prisma };
