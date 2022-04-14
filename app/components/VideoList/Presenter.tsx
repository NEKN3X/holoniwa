import { Video } from 'models/video'
import { VFC } from 'react'
import { VideoListItem } from 'components/VideoListItem'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { Mousewheel } from 'swiper'
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
      centeredSlides={true}
      mousewheel={true}
      loop={true}
      modules={[Mousewheel]}
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
