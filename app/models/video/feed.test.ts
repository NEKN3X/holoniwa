import { parseFeed } from "./feed"

const channelId = "UCL_qhgtOy0dy1Agp8vkySQg"

test("parseFeed()", async () => {
  await expect(parseFeed(channelId)).resolves.toBeTruthy()
  await expect(parseFeed("")).rejects.toThrowError()
  await expect(parseFeed("channelId")).rejects.toThrowError()
})
