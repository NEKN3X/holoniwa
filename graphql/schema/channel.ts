import { makeSchema, objectType, queryType } from 'nexus'
import { Channel } from 'nexus-prisma'

export const schema = makeSchema({
  types: [
    objectType({
      name: Channel.$name,
      definition(t) {
        t.field(Channel.id)
        t.field(Channel.title)
        t.field(Channel.thumbnail)
        t.field(Channel.description)
        t.field(Channel.publishedAt)
        t.field(Channel.Videos)
      },
    }),
    queryType({
      definition(t) {
        t.nonNull.list.nonNull.field('channels', {
          type: Channel.$name,
          resolve(_, __, ctx) {
            return ctx.prisma.channel.findMany()
          },
        })
      },
    }),
  ],
})
