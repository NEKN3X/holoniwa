import { db } from "~/db.server"

export const allChannels = () => db.channel.findMany()
