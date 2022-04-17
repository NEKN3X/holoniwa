// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'lib/prisma'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const liveStatus = req.query.liveStatus as string
  const today = new Date()
  const videos = await prisma.video.findMany({
    where: {
      AND: [
        { liveStatus: liveStatus },
        {
          OR: [
            { scheduledTime: null },
            {
              scheduledTime: {
                lte: new Date(today.setDate(today.getDate() + 14)),
              },
            },
          ],
        },
      ],
    },
    orderBy: {
      scheduledTime: 'asc',
    },
  })
  console.log(videos)

  res.status(200).json(videos)
}

export default handler
