import { Video } from 'models/Video'
import { VFC } from 'react'
import { VideoListItem } from 'components/VideoListItem'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'

import { FreeMode, Mousewheel } from 'swiper'
import { Center } from '@mantine/core'

type Props = {
  videos: Video[]
}

const Presenter: VFC<Props> = (props) => (
  <>
    <Swiper
      grabCursor={true}
      slidesPerView={4}
      spaceBetween={0}
      freeMode={true}
      mousewheel={true}
      modules={[FreeMode, Mousewheel]}
    >
      {props.videos.map((video) => (
        <SwiperSlide key={video.id}>
          <Center>
            <VideoListItem video={video} />
          </Center>
        </SwiperSlide>
      ))}
    </Swiper>
  </>
)

export default Presenter
