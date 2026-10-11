import { Track } from "@/types/player";

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  genre: string;
  tracksCount: number;
  totalDuration: number;
  coverUrl: string;
  notes: string;
  trackIds: string[];
}

export const MOCK_TRACKS: Track[] = [
  {
    "id": "yt-tEXYfT_G0W0",
    "youtubeId": "tEXYfT_G0W0",
    "title": "New Person, Same Old Mistakes",
    "artist": "Tame Impala",
    "album": "Currents",
    "duration": 364,
    "coverUrl": "https://yt3.googleusercontent.com/J67cuSWAzGMlj8d9orcAZjPHsl8RWcXIXkT1d8mGmx9jmXPvXkYpFzuLnucmaqJwVMqxPlSq1GbqPeQy=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Tame Impala — New Person, Same Old Mistakes",
    "source": "youtube"
  },
  {
    "id": "yt-qU9mHegkTc4",
    "youtubeId": "qU9mHegkTc4",
    "title": "505",
    "artist": "Arctic Monkeys",
    "album": "Favourite Worst Nightmare",
    "duration": 254,
    "coverUrl": "https://yt3.googleusercontent.com/F_Qgb74OCFJGWwkQpua2ITH4Z27HABNXVNxLGtTksu_BKUlQOLnftS2-NQ3nemam3AhSIBN35AfP_Qu4=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Arctic Monkeys — 505",
    "source": "youtube"
  },
  {
    "id": "yt-DlFXDl_ROAM",
    "youtubeId": "DlFXDl_ROAM",
    "title": "Die With A Smile",
    "artist": "Lady Gaga & Bruno Mars",
    "album": "MAYHEM",
    "duration": 252,
    "coverUrl": "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Lady Gaga & Bruno Mars — Die With A Smile",
    "source": "youtube"
  },
  {
    "id": "yt-Kf5pXDhx5Vc",
    "youtubeId": "Kf5pXDhx5Vc",
    "title": "End of Beginning",
    "artist": "Djo",
    "album": "DECIDE",
    "duration": 160,
    "coverUrl": "https://yt3.googleusercontent.com/k3a_2PTpRBfIG8KoKYcUFEAFLGGc5TIuEdAF4cF0yIeWkuKRYQ5T4eEwxuDAvJAoIfb8VYCRCWTTFVk=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Djo — End of Beginning",
    "source": "youtube"
  },
  {
    "id": "yt-cULQhvuq1Zc",
    "youtubeId": "cULQhvuq1Zc",
    "title": "Sweater Weather",
    "artist": "The Neighbourhood",
    "album": "I Love You.",
    "duration": 241,
    "coverUrl": "https://yt3.googleusercontent.com/rcGbeinqN-Z-9fLWpGlxeZlvH6tQZGDubHqEPDk91Wp3XKkWNuhNUQQnFWnaZHn9LPeaikxQlUE3O3ZBXg=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • The Neighbourhood — Sweater Weather",
    "source": "youtube"
  },
  {
    "id": "yt-pqrUQrAcfo4",
    "youtubeId": "pqrUQrAcfo4",
    "title": "Do I Wanna Know?",
    "artist": "Arctic Monkeys",
    "album": "AM",
    "duration": 273,
    "coverUrl": "https://yt3.googleusercontent.com/7a03Ybk8vbe8c4dl4E8l77Y4e9aEWjQvTfOAdLdXxsnjZ57gYQ8FsKra9SgXAHT-jtiwuq6lukCfbRKL=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Arctic Monkeys — Do I Wanna Know?",
    "source": "youtube"
  },
  {
    "id": "yt-XVveECQmiAk",
    "youtubeId": "XVveECQmiAk",
    "title": "luther",
    "artist": "Kendrick Lamar, SZA",
    "album": "GNX",
    "duration": 178,
    "coverUrl": "https://yt3.googleusercontent.com/nUcE0cU6y5BsIa_fpzqSMSc4qCpHoLxeWb6Co2xfMQOLO3ZTctzNopp8d35VyCPSWb0Z1I_1bxTTyyo=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Kendrick Lamar, SZA — luther",
    "source": "youtube"
  },
  {
    "id": "yt-NMRhx71bGo4",
    "youtubeId": "NMRhx71bGo4",
    "title": "Let It Happen",
    "artist": "Tame Impala",
    "album": "Currents",
    "duration": 468,
    "coverUrl": "https://yt3.googleusercontent.com/J67cuSWAzGMlj8d9orcAZjPHsl8RWcXIXkT1d8mGmx9jmXPvXkYpFzuLnucmaqJwVMqxPlSq1GbqPeQy=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Tame Impala — Let It Happen",
    "source": "youtube"
  },
  {
    "id": "yt-J7p4bzqLvCw",
    "youtubeId": "J7p4bzqLvCw",
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "album": "Blinding Lights",
    "duration": 202,
    "coverUrl": "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • The Weeknd — Blinding Lights",
    "source": "youtube"
  },
  {
    "id": "yt-c-8abSPAPOU",
    "youtubeId": "c-8abSPAPOU",
    "title": "back to friends",
    "artist": "sombr",
    "album": "I Barely Know Her",
    "duration": 200,
    "coverUrl": "https://yt3.googleusercontent.com/3MXiigZPuOrnx5imqnNpcemYNlkYqCoMeZBnCr8obqew8nNUf-cFqviScHNNo207t_7hs4ToWW_vvc862g=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • sombr — back to friends",
    "source": "youtube"
  },
  {
    "id": "yt-9RfVp-GhKfs",
    "youtubeId": "9RfVp-GhKfs",
    "title": "Creep",
    "artist": "Radiohead",
    "album": "Creep",
    "duration": 239,
    "coverUrl": "https://yt3.googleusercontent.com/-h_EmlrGLsJwhih3lVHGDmK3CAmLdpqEIeerAuJ71qmJeZ_5zYf9ElWIEBNiB_6_CbXh4qHchBpOqhCu=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Radiohead — Creep",
    "source": "youtube"
  },
  {
    "id": "yt-UnuEzP1rDLY",
    "youtubeId": "UnuEzP1rDLY",
    "title": "Babydoll",
    "artist": "Dominic Fike",
    "album": "Don't Forget About Me, Demos",
    "duration": 98,
    "coverUrl": "https://yt3.googleusercontent.com/whp_-mcgsovG5T-EAeunhXn5cOeOI0aW0mj3KM7hq9Sv0WcofRjqZGa8hivnG68fEaNvmn6J3g6r6Lc=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Dominic Fike — Babydoll",
    "source": "youtube"
  },
  {
    "id": "yt-m2zUrruKjDQ",
    "youtubeId": "m2zUrruKjDQ",
    "title": "Mr. Brightside",
    "artist": "The Killers",
    "album": "Hot Fuss",
    "duration": 223,
    "coverUrl": "https://yt3.googleusercontent.com/soFyZYOggw-Ae05b91WiVDnq9ahXLOrNJiR4wWiQemfclVliG_BHht1bH6f0cjLB0KzKlyGBTsPrtQEn=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • The Killers — Mr. Brightside",
    "source": "youtube"
  },
  {
    "id": "yt-rj5wZqReXQE",
    "youtubeId": "rj5wZqReXQE",
    "title": "Wonderwall",
    "artist": "Oasis",
    "album": "(What's The Story) Morning Glory? (Remastered)",
    "duration": 259,
    "coverUrl": "https://yt3.googleusercontent.com/FoVQFdW6zBi3sNA_yZJSV3VTWmi0belhhFzleuEbn27utkirstj1woXHfWmWqkNyHla37ZFbk_F6jvVV=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Oasis — Wonderwall",
    "source": "youtube"
  },
  {
    "id": "yt-oHVVoe2Vj8s",
    "youtubeId": "oHVVoe2Vj8s",
    "title": "Sign of the Times",
    "artist": "Harry Styles",
    "album": "Harry Styles",
    "duration": 341,
    "coverUrl": "https://yt3.googleusercontent.com/-LQ9U3M24vS9KyGUkG_kiTdNF5J9RckMcUwDBAdF7Sj5dN39SO1apKL7dq6zblUQ8XZnO05lqq8e9lbdSw=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Harry Styles — Sign of the Times",
    "source": "youtube"
  },
  {
    "id": "yt-90DKXLbzLto",
    "youtubeId": "90DKXLbzLto",
    "title": "The Night We Met",
    "artist": "Lord Huron",
    "album": "Strange Trails",
    "duration": 209,
    "coverUrl": "https://yt3.googleusercontent.com/lwBTJfz7s-ulND7iXu2fRTdnWM9lCjr_TsCrznzRPWOT46U2nkc6Mxv5wtgHKTqAmKv6Wtv47pAQAu9gIQ=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Lord Huron — The Night We Met",
    "source": "youtube"
  },
  {
    "id": "yt-wPY6dOC-MDA",
    "youtubeId": "wPY6dOC-MDA",
    "title": "Sailor Song",
    "artist": "Gigi Perez",
    "album": "At The Beach, In Every Life",
    "duration": 212,
    "coverUrl": "https://yt3.googleusercontent.com/Sav-wXPq2T-dpR_WgUp9r14zD5cVYdOkMPug9YaHonK-6GkwNBili0LqUqDHvto3JCreelpurgZRMC64=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Gigi Perez — Sailor Song",
    "source": "youtube"
  },
  {
    "id": "yt-BLZWkjBXfN8",
    "youtubeId": "BLZWkjBXfN8",
    "title": "In the End",
    "artist": "Linkin Park",
    "album": "Hybrid Theory (Bonus Edition)",
    "duration": 217,
    "coverUrl": "https://yt3.googleusercontent.com/lkNJVMp3siDfSw_zVYj3tE6fQS7G6Gj2gzoxrIwS7K4TwqmL_uSBb9-PKACNLIP_7XLQib4tC5XwWbpD=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Linkin Park — In the End",
    "source": "youtube"
  },
  {
    "id": "yt-cF3OWCYLLVQ",
    "youtubeId": "cF3OWCYLLVQ",
    "title": "Sultans of Swing",
    "artist": "Dire Straits",
    "album": "Dire Straits",
    "duration": 349,
    "coverUrl": "https://yt3.googleusercontent.com/GdHT5bKnRIKD7NdZwg80U5uWtQpF5OYMvWAYYxLhHQNFOMQTDnpXkAWbg0Jb7jMBLeaNPCdVx-iErwp1=w540-h540-s-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Dire Straits — Sultans of Swing",
    "source": "youtube"
  },
  {
    "id": "yt-5oWyMakvQew",
    "youtubeId": "5oWyMakvQew",
    "title": "Dreams",
    "artist": "Fleetwood Mac",
    "album": "Rumours (Deluxe Edition)",
    "duration": 258,
    "coverUrl": "https://yt3.googleusercontent.com/04-WDyeMjvBMA83dVvOcYNtY1PRRYTyjfVIKcbPAFW-VyArddajFZu8WQDIVAwJiR2EnpaC21Xz8_Ybt4g=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Fleetwood Mac — Dreams",
    "source": "youtube"
  },
  {
    "id": "yt-khnokW3Mw24",
    "youtubeId": "khnokW3Mw24",
    "title": "Instant Crush",
    "artist": "Daft Punk, Julian Casablancas",
    "album": "Random Access Memories",
    "duration": 338,
    "coverUrl": "https://yt3.googleusercontent.com/N55arCGj69gtw6thXK8JUPisxoVYiwuIEQ7I6SGlkEyNcSJ7xIWPe76Vuu1SiUqRyx5w9qvR_zV8fV3CWQ=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Daft Punk, Julian Casablancas — Instant Crush",
    "source": "youtube"
  },
  {
    "id": "yt-jtBmowJLc94",
    "youtubeId": "jtBmowJLc94",
    "title": "Cherry Waves",
    "artist": "Deftones",
    "album": "Saturday Night Wrist",
    "duration": 318,
    "coverUrl": "https://yt3.googleusercontent.com/TOBgRvdH0szlTWlLMr5krn9lpO7XwmqlcoYflg4YQlLsEWH-CxREc-WTH1vw9oqsyj7zrlA0fSKkDZw=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Deftones — Cherry Waves",
    "source": "youtube"
  },
  {
    "id": "yt-9qnqYL0eNNI",
    "youtubeId": "9qnqYL0eNNI",
    "title": "Yellow",
    "artist": "Coldplay",
    "album": "Parachutes",
    "duration": 267,
    "coverUrl": "https://yt3.googleusercontent.com/7RK5kFu8RjjulsxsPCJ55wmJLchKaaIRAYih0ldj--RGbnOOdA0U2vmLWyVfjPW82nR-Dwm2r8PhEi61=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Coldplay — Yellow",
    "source": "youtube"
  },
  {
    "id": "yt-YdRjNeu11Ww",
    "youtubeId": "YdRjNeu11Ww",
    "title": "Reptilia",
    "artist": "The Strokes",
    "album": "Room On Fire",
    "duration": 220,
    "coverUrl": "https://yt3.googleusercontent.com/IkjmGRNEs8pjJNVufyMdJxbZkPAcgRpfgalWkkKDBwTP6V_jiwkkWAwA3HrwVsmE3inaA_vqul68Rr94=w540-h540-s-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • The Strokes — Reptilia",
    "source": "youtube"
  },
  {
    "id": "yt-NxxjLD2pmlk",
    "youtubeId": "NxxjLD2pmlk",
    "title": "Feel Good Inc.",
    "artist": "Gorillaz",
    "album": "Demon Days",
    "duration": 223,
    "coverUrl": "https://yt3.googleusercontent.com/_3LJKVh0dy-71CwQzWKt0q7JHI7M2rxIMGGAdT0wEhmGEEELRX98ACJFdKK5Fyl226nuNfQ0OAMc-JtP=w540-h540-l90-rj",
    "genre": "Master",
    "year": "2025",
    "bitrate": "256 kbps AAC",
    "notes": "Master Cut • Gorillaz — Feel Good Inc.",
    "source": "youtube"
  }
];

export const MOCK_ALBUMS: Album[] = [
  {
    "id": "MPREb_AjwAqo5hI0U",
    "title": "Currents",
    "artist": "Tame Impala",
    "year": "2015",
    "genre": "Psychedelic Pop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/J67cuSWAzGMlj8d9orcAZjPHsl8RWcXIXkT1d8mGmx9jmXPvXkYpFzuLnucmaqJwVMqxPlSq1GbqPeQy=w540-h540-l90-rj",
    "notes": "Psychedelic Pop masterwork by Tame Impala released in 2015.",
    "trackIds": [
      "yt-tEXYfT_G0W0",
      "yt-NMRhx71bGo4"
    ]
  },
  {
    "id": "MPREb_A0XN6NPg9DL",
    "title": "Favourite Worst Nightmare",
    "artist": "Arctic Monkeys",
    "year": "2007",
    "genre": "Indie Rock",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/F_Qgb74OCFJGWwkQpua2ITH4Z27HABNXVNxLGtTksu_BKUlQOLnftS2-NQ3nemam3AhSIBN35AfP_Qu4=w540-h540-l90-rj",
    "notes": "Indie Rock masterwork by Arctic Monkeys released in 2007.",
    "trackIds": [
      "yt-qU9mHegkTc4",
      "yt-pqrUQrAcfo4"
    ]
  },
  {
    "id": "MPREb_K8qWMWVqXGi",
    "title": "Random Access Memories",
    "artist": "Daft Punk",
    "year": "2013",
    "genre": "Electronic / Disco",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/N55arCGj69gtw6thXK8JUPisxoVYiwuIEQ7I6SGlkEyNcSJ7xIWPe76Vuu1SiUqRyx5w9qvR_zV8fV3CWQ=w540-h540-l90-rj",
    "notes": "Electronic / Disco masterwork by Daft Punk released in 2013.",
    "trackIds": [
      "yt-khnokW3Mw24"
    ]
  },
  {
    "id": "MPREb_wCND3crJyDP",
    "title": "GNX",
    "artist": "Kendrick Lamar",
    "year": "2024",
    "genre": "Hip-Hop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/nUcE0cU6y5BsIa_fpzqSMSc4qCpHoLxeWb6Co2xfMQOLO3ZTctzNopp8d35VyCPSWb0Z1I_1bxTTyyo=w540-h540-l90-rj",
    "notes": "Hip-Hop masterwork by Kendrick Lamar released in 2024.",
    "trackIds": [
      "yt-XVveECQmiAk"
    ]
  },
  {
    "id": "MPREb_TH6Wut5eTMQ",
    "title": "After Hours",
    "artist": "The Weeknd",
    "year": "2020",
    "genre": "R&B / Synthpop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/JDKz3Anlyo49xBhFcFx13QD_Tk4-kqdiYTo15gtkL93nE8biWyZ7o0BPyW6RnXVxcXaJ5DgU5nJ_0NjJ=w540-h540-l90-rj",
    "notes": "R&B / Synthpop masterwork by The Weeknd released in 2020.",
    "trackIds": [
      "yt-J7p4bzqLvCw"
    ]
  },
  {
    "id": "MPREb_P8ayJmOVK6P",
    "title": "CHROMAKOPIA",
    "artist": "Tyler, The Creator",
    "year": "2024",
    "genre": "Hip-Hop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/E3i1vFwO2Xb1VSi3fy5D7cVqvcZbQjVXBWJVkTGt9M2H7vIQwCjFVpX0oR3MPIIltccVxbAHr8oPZZ8c=w540-h540-l90-rj",
    "notes": "Hip-Hop masterwork by Tyler, The Creator released in 2024.",
    "trackIds": [
      "yt-pqrUQrAcfo4"
    ]
  },
  {
    "id": "MPREb_m7saomf2NFN",
    "title": "AM",
    "artist": "Arctic Monkeys",
    "year": "2013",
    "genre": "Indie Rock",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/7a03Ybk8vbe8c4dl4E8l77Y4e9aEWjQvTfOAdLdXxsnjZ57gYQ8FsKra9SgXAHT-jtiwuq6lukCfbRKL=w540-h540-l90-rj",
    "notes": "Indie Rock masterwork by Arctic Monkeys released in 2013.",
    "trackIds": [
      "yt-qU9mHegkTc4",
      "yt-pqrUQrAcfo4"
    ]
  },
  {
    "id": "MPREb_R6C9lU4QEg2",
    "title": "In Rainbows",
    "artist": "Radiohead",
    "year": "2007",
    "genre": "Art Rock",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/BAl1FqoDaFrpWSSrr95Yjii4fJSeitdRcVt7f-uOVrhxQfmo5ActMNysFErQfI-CiOZR4GH2fePoVQtd=w540-h540-l90-rj",
    "notes": "Art Rock masterwork by Radiohead released in 2007.",
    "trackIds": [
      "yt-9RfVp-GhKfs"
    ]
  },
  {
    "id": "MPREb_or9GipYFiAw",
    "title": "Blonde",
    "artist": "Frank Ocean",
    "year": "2016",
    "genre": "Neo-Soul",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/TWBi2M7D8gIwoo3NmhGfoVKI-PuzDunLVYpmLCbeP8Uw2YWpnjttlxmVvpVaO8uSjmLPjHgy6iGXxlPF=w540-h540-l90-rj",
    "notes": "Neo-Soul masterwork by Frank Ocean released in 2016.",
    "trackIds": [
      "yt-J7p4bzqLvCw"
    ]
  },
  {
    "id": "MPREb_RDvvyRw6Xlu",
    "title": "DECIDE",
    "artist": "Djo",
    "year": "2022",
    "genre": "Synth-Pop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/k3a_2PTpRBfIG8KoKYcUFEAFLGGc5TIuEdAF4cF0yIeWkuKRYQ5T4eEwxuDAvJAoIfb8VYCRCWTTFVk=w540-h540-l90-rj",
    "notes": "Synth-Pop masterwork by Djo released in 2022.",
    "trackIds": [
      "yt-Kf5pXDhx5Vc"
    ]
  },
  {
    "id": "MPREb_0uvucD0LWSQ",
    "title": "I Love You.",
    "artist": "The Neighbourhood",
    "year": "2013",
    "genre": "Indie Pop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/rcGbeinqN-Z-9fLWpGlxeZlvH6tQZGDubHqEPDk91Wp3XKkWNuhNUQQnFWnaZHn9LPeaikxQlUE3O3ZBXg=w540-h540-l90-rj",
    "notes": "Indie Pop masterwork by The Neighbourhood released in 2013.",
    "trackIds": [
      "yt-cULQhvuq1Zc"
    ]
  },
  {
    "id": "MPREb_Ek5n6af6REp",
    "title": "Melodrama",
    "artist": "Lorde",
    "year": "2017",
    "genre": "Electropop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/m2nCAThlsFA_cNd7WrZyDzmxOGtvg2JrEQJ6ercmsdJQNs_bcktsLYV0vyiEL5vVCqS_pcTzkS1Ce23p=w540-h540-l90-rj",
    "notes": "Electropop masterwork by Lorde released in 2017.",
    "trackIds": [
      "yt-UnuEzP1rDLY"
    ]
  },
  {
    "id": "MPREb_2Tww0gIU6Os",
    "title": "Swimming",
    "artist": "Mac Miller",
    "year": "2018",
    "genre": "Hip-Hop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/YxyJh9VYIKgPAulnGiK6OMmBm2r_3eSTsm1myZu1qSKXlb77sSKlGl8VOgxU0tS1LJreNMntkktrp2Y=w540-h540-l90-rj",
    "notes": "Hip-Hop masterwork by Mac Miller released in 2018.",
    "trackIds": [
      "yt-m2zUrruKjDQ"
    ]
  },
  {
    "id": "MPREb_2az20wG4HxN",
    "title": "Demon Days",
    "artist": "Gorillaz",
    "year": "2005",
    "genre": "Alternative",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/_3LJKVh0dy-71CwQzWKt0q7JHI7M2rxIMGGAdT0wEhmGEEELRX98ACJFdKK5Fyl226nuNfQ0OAMc-JtP=w540-h540-l90-rj",
    "notes": "Alternative masterwork by Gorillaz released in 2005.",
    "trackIds": [
      "yt-NxxjLD2pmlk"
    ]
  },
  {
    "id": "MPREb_CA6gpEcQntH",
    "title": "Mezzanine",
    "artist": "Massive Attack",
    "year": "1998",
    "genre": "Trip-Hop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/eIwxQmmZOei9XmijUXzWsD9UIIPqW4xlzIHSyDq4hsB2KvAHC5vBQzg7Q-nnCdxKog3-5EZUyPsvzJkwMA=w540-h540-l90-rj",
    "notes": "Trip-Hop masterwork by Massive Attack released in 1998.",
    "trackIds": [
      "yt-oHVVoe2Vj8s"
    ]
  },
  {
    "id": "MPREb_hKmg93n3mUS",
    "title": "Sunburn",
    "artist": "Dominic Fike",
    "year": "2023",
    "genre": "Alternative Pop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/Hxt43le3B5AUBcUSLf8h7C7rv3cqy_IKFVaWMRX7BOSN690SigDfZNYmpxT74fn_coCVAL_TDUrrMPj8=w540-h540-l90-rj",
    "notes": "Alternative Pop masterwork by Dominic Fike released in 2023.",
    "trackIds": [
      "yt-UnuEzP1rDLY"
    ]
  },
  {
    "id": "MPREb_tdKpHxZ4C9Z",
    "title": "White Pony",
    "artist": "Deftones",
    "year": "2000",
    "genre": "Alt-Metal",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/XEJt-XhTk5piMoZX9bjWm9davr_AEVPE7RC4kMHLX77jzLjjWhqgDcvqoNLnuTgk2GiOWgU5FoaVJn0=w540-h540-l90-rj",
    "notes": "Alt-Metal masterwork by Deftones released in 2000.",
    "trackIds": [
      "yt-jtBmowJLc94"
    ]
  },
  {
    "id": "MPREb_jPOYfjGgApr",
    "title": "Nevermind",
    "artist": "Nirvana",
    "year": "1991",
    "genre": "Grunge",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/eyKiPBSqEu556sYTd_IyZhfxun5e_hatZ9tAyu8bnmVRgtbM3aW-SXUvhVX-d7s1oU0Yf3a38JOuYMZK5w=w540-h540-l90-rj",
    "notes": "Grunge masterwork by Nirvana released in 1991.",
    "trackIds": [
      "yt-BLZWkjBXfN8"
    ]
  },
  {
    "id": "MPREb_1SbgcDGdrT4",
    "title": "Rumours",
    "artist": "Fleetwood Mac",
    "year": "1977",
    "genre": "Classic Rock",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/q9xfDFsJXtmAU8MNFyGCMMHe7upmI6S8eDNrPdbJFRr-jeo_xNy8JDutjP2xdpmtl0xfQJYleYrXQGc=w540-h540-l90-rj",
    "notes": "Classic Rock masterwork by Fleetwood Mac released in 1977.",
    "trackIds": [
      "yt-5oWyMakvQew"
    ]
  },
  {
    "id": "MPREb_9nqEki4ZDpp",
    "title": "(What's the Story) Morning Glory?",
    "artist": "Oasis",
    "year": "1995",
    "genre": "Britpop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/FoVQFdW6zBi3sNA_yZJSV3VTWmi0belhhFzleuEbn27utkirstj1woXHfWmWqkNyHla37ZFbk_F6jvVV=w540-h540-l90-rj",
    "notes": "Britpop masterwork by Oasis released in 1995.",
    "trackIds": [
      "yt-rj5wZqReXQE"
    ]
  },
  {
    "id": "MPREb_nHbCAGX6uUL",
    "title": "The Dark Side of the Moon",
    "artist": "Pink Floyd",
    "year": "1973",
    "genre": "Prog Rock",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/lfiVQfNhs8F77ZOE_OyAftPDGXNY8WfkIVg67gNVxaJHLef7QIXsm7CAcaT4o3AyyLTaQeqWguKel0g=w540-h540-l90-rj",
    "notes": "Prog Rock masterwork by Pink Floyd released in 1973.",
    "trackIds": [
      "yt-khnokW3Mw24"
    ]
  },
  {
    "id": "MPREb_U4m9ZEeYxdi",
    "title": "A Rush of Blood to the Head",
    "artist": "Coldplay",
    "year": "2002",
    "genre": "Post-Britpop",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/-5tnsyG-BDCZj2gipRW710kLtHWPDVmlvt2BMwJ4StWqrfMxRUYvLsirYPClRDg1qnDU3avAgVn66eS20A=w540-h540-l90-rj",
    "notes": "Post-Britpop masterwork by Coldplay released in 2002.",
    "trackIds": [
      "yt-9qnqYL0eNNI"
    ]
  },
  {
    "id": "MPREb_w4FkzanBBnt",
    "title": "Is This It",
    "artist": "The Strokes",
    "year": "2001",
    "genre": "Garage Rock",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/pC3z_hnQSQCi4PGNdImJyFwOUwuneY39EnsMiGZhqjREZMxWnpSptv97zcl7nLojlf4KeOj5z25DZjpS=w540-h540-l90-rj",
    "notes": "Garage Rock masterwork by The Strokes released in 2001.",
    "trackIds": [
      "yt-YdRjNeu11Ww"
    ]
  },
  {
    "id": "MPREb_6si4Ckr7jcD",
    "title": "Origin of Symmetry",
    "artist": "Muse",
    "year": "2001",
    "genre": "Alt-Rock",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/IimEK_f6ZYM-yBCQbdU-P4wUxggRZxKfawmaflEW40x5jk6fdLoo5CtBG61LNQqDnpnDqGvlhdk6vnOC=w540-h540-l90-rj",
    "notes": "Alt-Rock masterwork by Muse released in 2001.",
    "trackIds": [
      "yt-YdRjNeu11Ww"
    ]
  },
  {
    "id": "MPREb_qMlbe7gLeuH",
    "title": "Meteora",
    "artist": "Linkin Park",
    "year": "2003",
    "genre": "Nu-Metal",
    "tracksCount": 12,
    "totalDuration": 2400,
    "coverUrl": "https://yt3.googleusercontent.com/dNfpEZtqYYsrHaHpSE9ik5vGgUSVLKE5DycRz8VMLdIQV_GYz7GpGUkMnU9I0926zLRQEAIUwdsjYCuG=w540-h540-l90-rj",
    "notes": "Nu-Metal masterwork by Linkin Park released in 2003.",
    "trackIds": [
      "yt-BLZWkjBXfN8"
    ]
  }
];
