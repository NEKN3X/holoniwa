import { PrismaClient } from '@prisma/client'
import { channels } from '../data/channels'
const prisma = new PrismaClient()

const main = async () => {
  await prisma.channel.deleteMany()

  const data = channels.map((channel) => {
    return { ...channel, publishedAt: new Date(channel.publishedAt) }
  })
  for (const channel of data) {
    await prisma.channel.create({ data: channel })
  }
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
