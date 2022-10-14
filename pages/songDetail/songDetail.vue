<template>
  <view class="song-detail-container">
    <view class="author">{{song.ar[0].name}}</view>
    <view class="circle"></view>
    <image class="needle" src="/static/images/song/needle.png" :class="isPlay == true ? 'needle-rotate' : ''"></image>

    <!-- 磁盘区域 -->
    <view class="disc-container" :class="isPlay == true ? 'disc-animation' : ''">
      <image src="/static/images/song/disc.png" class="disc"></image>
      <image :src="song.al.picUrl" class="music-img"></image>
    </view>
    
    <!-- 进度条控制区域 -->
    <view class="progress-control">
      <text>{{currentTime}}</text>
      <view class="bar">
        <view class="current-time-bar" :style="'width:' + currentWidth + 'rpx'">
          <view class="audio-circle"></view>
        </view>
      </view>
      <text>{{durationTime}}</text>
    </view>

    <!-- 底部控制播放区域 -->
    <view class="music-control">
      <text class="iconfont icon-24gl-shuffle"></text>
      <text class="iconfont icon-shangyishoushangyige" @click="handleSwitch('pre')"></text>
      <text class="iconfont icon-24gl-playCircle big" v-if="!isPlay" @click="handleMusicPlay"></text>
      <text class="iconfont icon-24gl-pauseCircle big" v-else @click="handleMusicPlay"></text>
      <text class="iconfont icon-xiayigexiayishou" @click="handleSwitch('next')"></text>
      <text class="iconfont icon-24gl-playlistMusic3"></text>
    </view>
  </view>
</template>

<script>
  // 获取全局实例
  const app = getApp()
  import moment from 'moment'
  
  export default {
    data() {
      return {
        isPlay: false,
        musicId: '',
        song: {},
        musicLink: '',
        currentTime:'00:00',
        durationTime:'00:00',
        currentWidth:0,
        backgroundAudioManager:{}
      }
    },
    onLoad(options) {
      // options: 用于接收路由跳转的query参数
      this.musicId = options.musicId
      this.getMusicInfo()
      
      // 判断当前页面音乐是否在播放
      if(app.globalData.isMusicPlay && app.globalData.musicId == this.musicId){
        // 修改当前页面音乐播放状态为true
        this.isPlay = true
      }

      // 创建背景音频管理器
      this.backgroundAudioManager = uni.getBackgroundAudioManager()
      // 监视音乐播放/暂停/停止，用于解决系统和小程序状态不一致的问题
      this.backgroundAudioManager.onPlay(() => {
        this.changePlayState(true)
        // 修改全局音乐播放的状态
        app.globalData.musicId = this.musicId
      })
      this.backgroundAudioManager.onPause(() => {
        this.changePlayState(false)
      })
      this.backgroundAudioManager.onStop(() => {
        this.changePlayState(false)
      })
      
      // 监听音乐自然结束，自动切换至下一首音乐，并且自动播放
      this.backgroundAudioManager.onEnded(() => {
        this.handleSwitch('next')
        this.currentTime = '00:00'
        this.currentWidth = 0
      })
      
      // 监听音乐实时播放进度
      this.backgroundAudioManager.onTimeUpdate(() => {
        // this.backgroundAudioManager.currentTime单位为s
        this.currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
        this.currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450
      })
    },
    methods: {
      // 改变音乐播放状态
      changePlayState(isPlay){
        this.isPlay = isPlay
        app.globalData.isMusicPlay = isPlay
      },
      // 点击播放/暂停的回调
      handleMusicPlay() {
        this.isPlay = !this.isPlay
        this.musicControl(this.isPlay, this.musicId, this.musicLink)
      },
      async getMusicInfo() {
        let result = await this.$request({
          url: '/song/detail',
          data: {
            ids: this.musicId
          }
        })
        this.song = result.songs[0]
        // 修改总时长
        this.durationTime = moment(this.song.dt).format('mm:ss')
        // 动态修改标题
        uni.setNavigationBarTitle({
          title: this.song.name
        })
      },
      // 控制音乐播放/暂停的功能函数
      async musicControl(isPlay, musicId, musicLink) {
        if (isPlay) {
          // 性能优化：当前如果请求过链接，那么不需再请求
          if (!musicLink) {
            // 获取音乐播放链接
            let result = await this.$request({
              url: '/song/url',
              data: {
                id: musicId
              }
            })
            this.musicLink = result.data[0].url
          }
          this.backgroundAudioManager.src = this.musicLink
          this.backgroundAudioManager.title = this.song.name
        } else {
          // 暂停音乐
          this.backgroundAudioManager.pause()
        }
      },
      handleSwitch(type){
        // 关闭当前音乐
        this.backgroundAudioManager.stop()
        this.$bus.$on('musicId',(musicId) => {
          this.musicId = musicId
          this.getMusicInfo()
          // 自动播放当前音乐
          this.musicControl(true, this.musicId)
          // 关闭监听，因为每点击一次，进行一次监听，因此会将之前的监听数据存储，形成数组，所以监听完毕操作完成后要关闭监听
          this.$bus.$off('musicId')
        })
        this.$bus.$emit('switchSong', type)
      },
      sliderChange(event){
        console.log(event.detail.value)
      }
    }
  }
</script>

<style scoped lang="scss">
  .song-detail-container {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    
    .author{
      margin-top: 20rpx;
    }

    .circle {
      position: relative;
      z-index: 100;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #fff;
      margin: 10rpx 0;
    }

    .needle {
      position: relative;
      z-index: 99;
      top: -40rpx;
      left: 60rpx;
      width: 192rpx;
      height: 274rpx;
      transform-origin: 40rpx 0;
      transform: rotate(-20deg);
      transition: all 1s;
    }

    .needle-rotate {
      transform: rotate(0deg);
    }

    .disc-container {
      position: relative;
      top: -170rpx;
      width: 598rpx;
      height: 598rpx;

      .disc {
        width: 100%;
        height: 100%;
      }

      .music-img {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 370rpx;
        height: 370rpx;
        border-radius: 50%;
      }
    }

    .disc-animation {
      animation: disc 4s linear 1s infinite;
    }

    @keyframes disc {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    .music-control {
      position: absolute;
      bottom: 40rpx;
      left: 0;
      border-top: 1px solid #fff;
      width: 100%;
      display: flex;

      text {
        width: 20%;
        height: 120rpx;
        line-height: 120rpx;
        text-align: center;
        color: #fff;
        font-size: 50rpx;
      }

      .big {
        font-size: 80rpx;
      }
    }
  
    .progress-control{
      position: absolute;
      bottom: 200rpx;
      width: 640rpx;
      height: 80rpx;
      line-height: 80rpx;
      display: flex;
      
      .bar{
        position: relative;
        width: 450rpx;
        height: 4rpx;
        background: rgba(0, 0, 0, 0.4);
        margin: auto 20rpx;
        
        .current-time-bar{
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          width: 100rpx;
          height: 4rpx;
          background-color: red;
          
          .audio-circle{
            position: absolute;
            right: -12rpx;
            top: -4rpx;
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            background-color: #fff;
          }
        }
      }
    }
  }
</style>
