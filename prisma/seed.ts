import { PrismaClient } from "@prisma/client"
import { parse } from "csv-parse"
import fs from "fs"
import * as path from "path"
const prisma = new PrismaClient()

type Channel = {
  id: string
  title: string
  thumbnail: string
  description: string
  publishedAt: string
}

const main = () => {
  const csvFilePath = path.join(process.cwd(), "prisma/channels.csv")

  const headers = ["id", "title", "thumbnail", "description", "publishedAt"]

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

  parse(
    fileContent,
    {
      delimiter: ",",
      columns: headers,
    },
    (error, result: Channel[]) => {
      if (error) {
        console.error(error)
      }
      const channels = result.map((channel) => {
        return {
          id: channel.id,
          title: channel.title,
          thumbnail: channel.thumbnail,
          description: channel.description,
          publishedAt: new Date(channel.publishedAt),
        }
      })

      prisma.channel.createMany({ data: channels }).then(() => {
        console.log("channels created")
        process.exit()
      })
    },
  )
}

main()
