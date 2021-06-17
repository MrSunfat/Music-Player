/*
1. Render songs => ok
2. scroll top => ok
3. Play/ pause / seek => ok
4. CD rotate => ok
5. Next / prev => ok
6. Random
7. Next / Repeat when ended
8. Active song
9. Scroll active song into view 
10. Play song when click
*/

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'f8_PLAYER'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Dun DUn",
            singer: "EVERGLOW",
            path: "./assets/music/DUN-DUN-EVERGLOW.mp3",
            image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/1/1/9/2/1192291dd4901e977ce4c019b26864d6.jpg"

        },
        {
            name: "Psycho",
            singer: "Red Velvet",
            path: "./assets/music/Psycho-Red-Velvet.mp3",
            image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/c/8/d/f/c8dff6d560cf48dc1da199c62b9924d9.jpg"

        },
        {
            name: "Bai hat ru (Rauf& Faik)",
            singer: "Rauf-Faik",
            path: "./assets/music/Bai-hat-ru-Rauf-Faik.mp3",
            image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/a/e/a/f/aeaf0ea7983a9582abac187a7ea7f09e.jpg"

        },
        {
            name: "Perfect",
            singer: "Ed Sheeran",
            path: "./assets/music/Perfect - Ed Sheeran (NhacPro.net).mp3",
            image: "https://upload.wikimedia.org/wikipedia/vi/7/79/Ed_Sheeran_and_Beyonce_-_Perfect_Duet.png"

        },
        {
            name: "End of Time",
            singer: "K-391, Alan Waker, Ahrix",
            path: "./assets/music/End-of-Time-K-391-Alan-Walker-Ahrix.mp3",
            image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/f/1/e/4/f1e4d3c7784d53cd9122f5de5a2875b4.jpg"

        },
        {
            name: "Sky",
            singer: "Alan Waker, Alex Skrindo",
            path: "./assets/music/Sky-Alan-Walker-Alex-Skrindo.mp3",
            image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/covers/b/1/b1dd31a95b3995822eda6ab0546cc93e_1498272077.jpg"

        },
        {
            name: "Force",
            singer: "Alan Waker",
            path: "./assets/music/Force-Alan-Walker.mp3",
            image: "https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/covers/b/f/bf43d9947aa5c8f8fdbb4e16a5d0f68e_1475229730.jpg"

        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index=== this.currentIndex ? 'active' : ''}" data-index ="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })

        playlist.innerHTML = htmls.join('')
    },
    defineProperty: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent: function() {
        const _this = this // do this trong "xu ly play" , dung this la this chinh cai funtion do 
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay/ dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 s
            iterations: Infinity //
        })
        cdThumbAnimate.pause()

        // Xu ly phong to/ thu nho CD
        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            const newCdWidth =  cdWidth -scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xu ly khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        // Khi bai hat ( song) dc play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi bai hat ( song) dc pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime/ audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua bài hát 
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration / 100
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xu ly bat/ tat random
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xư ly phat lai bai hat ( song)
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xu ly audio sau khi ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                
                // Xu ly khi click vao song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // Xu ly khi click vao song option
                if(e.target.closest('.option')) {

                }

            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex 
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(this.currentIndex === newIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        // Gắn cấu hình từ config vào ứng dụng (object)
        this.loadConfig()
        // Dinh nghia cac thuoc tinh cho object
        this.defineProperty()

        // lang nghe / xu ly cac su kien ( DOM EVENTS)
        this.handleEvent()

        // Tai thong tin bai hat dau tien vao UI khi chay ung dung
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của Random repeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()
