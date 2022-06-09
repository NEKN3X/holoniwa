import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const channels = [
  {
    id: "UC-hM6YJuNYVAmUWxeIr9FeA",
    title: "Miko Ch. さくらみこ",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLR4HgNRKHFFp8B_r3Tex0UA3a81s_2Rb9TkVf12BA=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC0TXe_LYZ4scaW2XMyi5_kw",
    title: "AZKi Channel",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLRQRw-0zclxstcQV7QI-5AKt8YwC-MbWRvX8MYXqA=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC1CfXB_kRs3C-zaeTG3oGyg",
    title: "HAACHAMA Ch 赤井はあと",
    thumbnail:
      "https://yt3.ggpht.com/rNj6bichsOoUjA2N9iXWxInEt9Y2Fo5fhG4S8oR17ip8ouCu_7wmX3PnQxt6OP6Rd9OlYXYcmw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC1DCedRgGHBdm81E1llLhOQ",
    title: "Pekora Ch. 兎田ぺこら",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQQK7jpsudTTDO1JA4mnwyUCCDY5YSzxQrmNEeb7Q=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC1opHUrw8rvnsadT-iGp7Cg",
    title: "Aqua Ch. 湊あくあ",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLT8eMK0R-4YoVFyKUt3r6jqZA4uq9cHf1hyVv-Oyg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC1suqwovbL1kzsoaZgFZLKg",
    title: "Choco Ch. 癒月ちょこ",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQQWlPXEl3Yt1ISaGW7m1dVtuzJ5P0wBjSg5zG41g=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC1uv2Oq6kNxgATlCiez59hw",
    title: "Towa Ch. 常闇トワ",
    thumbnail:
      "https://yt3.ggpht.com/meRnxbRUm5yPSwq8Q5QpI5maFApm5QTGQV_LGblQFsoO0yAV4LI-nSZ70GYwMZ_tbfSa_O8MTCU=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC3n5uGu18FoCy23ggWWp8tA",
    title: "Nanashi Mumei Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/owZmjfnG_SGVmfkl3eS7Lv47pGvIr2SrS36imh6O8i0H3Wy41fYKD26U7wnyRB627fXoq0aQ0Q=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC5CwaMl1eIgY8h02uZw7u8A",
    title: "Suisei Channel",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLT7D-JlLZGTq6Y95nLxeXG2B-7WMGpFXZ7Qa4iY5w=s800-c-k-c0x00ffffff-no-rj-mo",
  },
  {
    id: "UC6eWCld0KwmyHFbAqK3V-Rw",
    title: "Koyori ch. 博衣こより - holoX -",
    thumbnail:
      "https://yt3.ggpht.com/WO7ItKNmy6tW_NQ82g8c1y74CZSw6GsSdynsE5s2csuEok2fHRrAaGcBV3JJO-2BxEOXXA8lvw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC727SQYUvx5pDDGQpTICNWg",
    title: "Anya Melfissa Ch. hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLR0AplPQyxSjGhqMxJy7vAvXn-9hyaiXBoBE5vy=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC7fk0CB07ly8oSl0aqKkqFg",
    title: "Nakiri Ayame Ch. 百鬼あやめ",
    thumbnail:
      "https://yt3.ggpht.com/XDGhKwPZcT16Ppg2gQmLHEIYRhw9sY4rqG0HWbeCH68LHkhlVQrrFgxd5hWUuMb2nLfDOhu6=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC8rcEBzJSleTkf_-agPM20g",
    title: "IRyS Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/oC30wBZ04ibFN7AQVHAjdUX-3nS-h4DDjJBYVlsKt0OF6t1CZwrgzWlr3rS6Q12kXrw3-mt9gg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCAWSyEs_Io8MtpY3m-zqILA",
    title: "Nene Ch.桃鈴ねね",
    thumbnail:
      "https://yt3.ggpht.com/bMBMxmB1YVDVazU-8KbB6JZqUHn4YzmFiQRWwEUHCeqm5REPW7HHQChC5xE6e36aqqnXgK4a=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCAoy6rzhSf4ydcYjJw3WoVg",
    title: "Airani Iofifteen Channel hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/QhX_FZkasltk6_YoDX_PEGsTSku2vr6KwhxG54ghKE2MeKAf3kbuI8p8viy5TCvwpfisjI3Axw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCCzUftO8KOVkV4wQG1vkUvg",
    title: "Marine Ch. 宝鐘マリン",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLSM7GhkxA3mNjSi4SWV62Hq7PjM2epq2Br1xGsZDw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCD8HOxPs4Xvsm8H0ZxXGiBw",
    title: "Mel Channel 夜空メルチャンネル",
    thumbnail:
      "https://yt3.ggpht.com/lj909MK0P40YuGurbNswbYSywUkDi_7cwpLDzSzRb4R82VKopTGw_zERnZZeFPgrSC6_N6bKbDU=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCDqI2jOz0weumE8s7paEk6g",
    title: "Roboco Ch. - ロボ子",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLT1nccfyEH7yPGHnNqO7C8Ak2jw3scnVdKfSnTe2g=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCENwRMx5Yh42zWpzURebzTw",
    title: "Laplus ch. ラプラス・ダークネス - holoX -",
    thumbnail:
      "https://yt3.ggpht.com/roGS60A8a_lDbVakIg1JU3u3hbtjHSTilMGHMizuPKh7tuoY2nl46raxuW2f_83IKFGMjL6Z=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCFKOVgVbGmX65RxO3EtH3iw",
    title: "Lamy Ch. 雪花ラミィ",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQVpWb-K93rLNGFHHyhgg45VE7FVBwJQz67JqJvvQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCFTLzh12_nrtzqBPsTCqenA",
    title: "アキロゼCh。Vtuber/ホロライブ所属",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLS57LOo-VajYzEWa_OfnI8CuAgXTXCrXxwcINVqOg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCHsx4Hqa-1ORjQTh9TYDhww",
    title: "Takanashi Kiara Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/w7TKJYU7zmamFmf-WxfahCo_K7Bg2__Pk-CCBNnbewMG-77OZLqJO9MLvDAmH9nEkZH8OkWgSQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCIBY1ollUsauvVi4hW4cumw",
    title: "Chloe ch. 沙花叉クロヱ - holoX -",
    thumbnail:
      "https://yt3.ggpht.com/_xNtPLKQcQxMTnOr4tAcGz0GEeESsi0bQX9mJEP3fx_50a8GUfUyOG1eyLIld2cCz6GvKABwpQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCJFZiqLMntJufDCHc6bQixg",
    title: "hololive ホロライブ - VTuber Group",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLShj3wK6CEmow693uwoMqS7yj09e3AvtdrIRsXHQw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCK9V2B22uJYu3N7eR_BT9QA",
    title: "Polka Ch. 尾丸ポルカ",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLSNfuszQyKT1RGn7SaYyefnhGiUZsTsWpmjWD9_vw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCL_qhgtOy0dy1Agp8vkySQg",
    title: "Mori Calliope Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/WJXoiG8qPqlTVGSb_hhND0DQtXqzlq05eGuR9C5a7f06a8ksVnZ8633kJOW9L4qGHnj5HU_OUw=s800-c-k-c0x00ffffff-no-nd-rj",
  },
  {
    id: "UCMwGHR0BTZuLsmjY_NT5Pwg",
    title: "Ninomae Ina'nis Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/f4uYWHJxiGwyXm8NUlm818N1MRnywtgL6wM8JdWqWsKBzI7v1eg8dxDWG7igkWuukUSiufydqPg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCO_aKKYxn4tvrqPjcTzZ6EQ",
    title: "Ceres Fauna Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/cBtserkb211p6If2OewgWd8oriIKRkfwTcP4_Vdq2YETG5TK9Q02v4cYmnLU03KBAJ0gcDha7oQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCOyYb1c43VlX9rc_lT6NKQw",
    title: "Ayunda Risu Ch. hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLTjqfaFS9JlspGjiIah2kkxOtl4vRrxBCYKMEY5Kw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCP0BspO_AMEe3aQqqpo89Dg",
    title: "Moona Hoshinova hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLRaHP1Qoi3zFxbQYdbX4MNnV18TrqjFBwDxgTlNqg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCQ0UDLQCjY0rmuxCDE38FGg",
    title: "Matsuri Channel 夏色まつり",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLSNQXD5ugR_J9CwxVy4cMcmWR0tdSZmYl2S7NDeOg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCTvHWSfBZgtxE4sILOaurIQ",
    title: "Vestia Zeta Ch. hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/-IdVo-vK7pr0VRjJDdza1-t1Edjce1Rd1R1hon_3SRIzuQ-XVBTWOJj-UfwYPp8y40KM197_y4o=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCUKD-uaobj9jiqB-VXt71mA",
    title: "Botan Ch.獅白ぼたん",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQdkkvIUKvlsXj_XRJuQHxep4C61MQPhVjCuTE1=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCXTpFs_3PqI41qX2d9tL2Rw",
    title: "Shion Ch. 紫咲シオン",
    thumbnail:
      "https://yt3.ggpht.com/AyUL9W0ltc_aJr_MysuZBx8hRfb1SIVNREgU9kiOO-lqmdhYkEsllmhagertVIwHwa3UAAKy=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCYz_5n-uDuChHtLo7My1HnQ",
    title: "Kureiji Ollie Ch. hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/jWxru6sHDDSuKF-gztFg_WSoMp2da_d019iH0xz0MDWc7TIhetK8id_mVKV0PxWKp-QS23AzfQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCZLZ8Jjx_RN2CXloOmgTHVg",
    title: "Kaela Kovalskia Ch. hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/PxkGgLvMEUgmme35T0VPLR8d5brJw4YTzJC5PE48mkYRdy-mq8FsKv_Sy-bJmxqvlgtitqMWtg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCZlDXzGoo7d44bwdNObFacg",
    title: "Kanata Ch. 天音かなた",
    thumbnail:
      "https://yt3.ggpht.com/TlH8nz5O9UYo5JZ_5fo4JfXdT18N0Ck27wWrulni-c1g5bwes0tVmFiSKICzI1SW7itaTkk9GA=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UC_vMYWcDjmfdpH6r4TTn1MQ",
    title: "Iroha ch. 風真いろは - holoX -",
    thumbnail:
      "https://yt3.ggpht.com/YK_UCAbw_pFBHSOw_LGWI-WCJDdvMP3y9mmODQ1IFEnNVvcf-M3-q22Db5TLWuAbfboMNFTMIg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCa9Y57gfeY0Zro_noHRVrnw",
    title: "Luna Ch. 姫森ルーナ",
    thumbnail:
      "https://yt3.ggpht.com/O7m_5HMY_O8yxR3Jhn9cEO1fLNL_GifMERExnAmfY7JrdTRsTjNijTcNYTPN97Llj3zGn8Susw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCdn5BQ06XqgXoAxIhbqw5Rg",
    title: "フブキCh。白上フブキ",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQdiN_0b5mfCHcwmIbRZKvpwowneYzu9xL0oCBBMw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCdyqAaZDKHXg4Ahi7VENThQ",
    title: "Noel Ch. 白銀ノエル",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQW7DXGL_nPlEiuqvHzJBiSZKiS5VKqrxzvKHLL9A=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCfrWoRGlawPQDQxxeIDRP0Q",
    title: "hololive Indonesia",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQMVO-nqdgHS1Fht9IRSWPC99g-EYsGum8tSVmDFQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCgmPnx-EEeOrZSg5Tiw7ZRQ",
    title: "Hakos Baelz Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/7gFSRIM3_DhczV8AYjeP4EaS0OL-u_xLvIh9JhG9zJhPYEfVwsoUOK61L6eBlLjnPHN-EDvytQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UChAnqc_AY5_I3Px5dig3X1Q",
    title: "Korone Ch. 戌神ころね",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLTGCZfOdpj8vnNV4hbPvxJrlbERhgBWnBrWKbS5WQ=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UChgTyjG-pdNvxxhdsXfHQ5Q",
    title: "Pavolia Reine Ch. hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/sG7Yb1kCxTEP9ft03E-1Tr2Rho8GhMZ0_Kq9rf5MojWY9pf8vSL24xPG8e8GaE4jOxQKYlSvaL0=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCjLEmnpCNeisMxy134KPwWw",
    title: "Kobo Kanaeru Ch. hololive-ID",
    thumbnail:
      "https://yt3.ggpht.com/FDU40V14C_-YbLcd_f9zeqaFhZJ8kY1D2UL0H4L81QNBaxOQg09G7ZA1hqU8M61Vzy3gQl81PA=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCmbs8T6MWqUHP1tIQvSgKrg",
    title: "Ouro Kronii Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/6670YE31bbAtAi7m_UL-KWZBdL5wvmfHlLtcS4HxsBZBQNqmAk7Y-iiIOjawO_0HYXpS4HfC=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCoSrY_IQQVpmIRZ9Xf-y93g",
    title: "Gawr Gura Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/uMUat6yJL2_Sk6Wg2-yn0fSIqUr_D6aKVNVoWbgeZ8N-edT5QJAusk4PI8nmPgT_DxFDTyl8=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCotXwY6s8pWmuWd_snKYjhg",
    title: "hololive English",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQGbQmuzLspD-AWRcyeaOj5WdroBC507C31D0kTfw=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCp-5t9SrOQwXMU7iIjQfARg",
    title: "Mio Channel 大神ミオ",
    thumbnail:
      "https://yt3.ggpht.com/Z78RNXxUqpOGYKFt-VrJV7nlehOHzl7Ta-l1cgPx5Ewucmr5kY64iGxmPSe7QqIdM1ZhvPlEOg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCp6993wxpyDPHUpavwDFqgg",
    title: "SoraCh. ときのそらチャンネル",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLRo4fRoifdnGRyvGIOVxiumNdD5MXweEPHLO_SBrA=s800-c-k-c0x00ffffff-no-rj-mo",
  },
  {
    id: "UCqm3BQLlJfvkTsX_hvm0UmA",
    title: "Watame Ch. 角巻わため",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLQ74gCnVzTJAJTtjvXlRGQLwcYMQ8HppeWsaJYd1w=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCs9_O1tRPMQTHQ-N_L6FU2g",
    title: "Lui ch. 鷹嶺ルイ - holoX -",
    thumbnail:
      "https://yt3.ggpht.com/R_IzGiw1xDQp0y9zVvGkF9e8Gj8wtr2_551Ez3X6gOMIj3e6jra1I1suuK_jH9FqigBj8ywg=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCsUj0dszADCGbF3gNrQEuSQ",
    title: "Tsukumo Sana Ch. hololive-EN",
    thumbnail:
      "https://yt3.ggpht.com/zczPLp_sj4Qq3CyoGzfXifOdwE7aMHRpUdqbMD9UKvjddBG2NdMrCKElCMUOS6x85BMr2VGuAA=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCvInZx9h3jC2JzsIzoOebWg",
    title: "Flare Ch. 不知火フレア",
    thumbnail:
      "https://yt3.ggpht.com/d9aIrGtZR0eI4k1Wnev5f_R4llIBsWnQOjkdsqkMycoAxA3g_zz-jyeBl8tEHfbm1iTg0SJj=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCvaTdHTWBGv3MKj3KVqJVCw",
    title: "Okayu Ch. 猫又おかゆ",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLTBrp9cAeaFT4Yq9DVne54QYANyrhNv8Kd6NR7N7w=s800-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "UCvzGlP9oQwU--Y0r9id_jnA",
    title: "Subaru Ch. 大空スバル",
    thumbnail:
      "https://yt3.ggpht.com/ytc/AKedOLTvmlGMQcpO8IoSpj0iScUs0dPZHvNtj1C7ZQjHbg=s800-c-k-c0x00ffffff-no-rj",
  },
]

const main = () => {
  channels.map(channel => {
    return {
      id: channel.id,
      title: channel.title,
      thumbnail: channel.thumbnail,
    }
  })

  prisma.channel.createMany({ data: channels }).then(() => {
    console.log("channels created")
    process.exit()
  })
}

main()
