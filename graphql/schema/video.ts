import { makeSchema, objectType, queryType } from 'nexus'
import { Video } from 'nexus-prisma'

export const schema = makeSchema({
  types: [
    objectType({
      name: Video.$name,
      definition(t) {
        t.field(Video.id)
        t.field(Video.title)
        t.field(Video.Channel)
        t.field(Video.publishedAt)
        t.field(Video.thumbnail)
        t.field(Video.description)
        t.field(Video.liveStatus)
        t.field(Video.uploadStatus)
        t.field(Video.privacyStatus)
        t.field(Video.startTime)
        t.field(Video.endTime)
        t.field(Video.scheduledTime)
        t.field(Video.duration)
      },
    }),
    queryType({
      definition(t) {
        t.nonNull.list.nonNull.field('videos', {
          type: Video.$name,
          resolve(_, __, ctx) {
            return ctx.prisma.video.findMany()
          },
        })
      },
    }),
  ],
})
