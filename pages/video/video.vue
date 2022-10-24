<template>
  <view class="video-container">
    <!-- 头部区域 -->
    <view class="header">
      <image src="/static/images/video/video.jpg"></image>
      <view class="search" @click="toSearch">搜索音乐</view>
      <image src="/static/images/logo.png"></image>
    </view>
    <!-- 导航区域 -->
    <scroll-view class="nav-scroll" scroll-x enable-flex :scroll-into-view="'scroll' + navId" scroll-with-animation>
      <view class="nav-item" v-for="item in videoGroupList" :key="item.id" :id="'scroll' + item.id">
        <view class="nav-content" @click="changeNav(item.id)" :class="navId == item.id ? 'active' : ''">
          {{item.name}}
        </view>
      </view>
    </scroll-view>
    <!-- 视频区域 -->
    <scroll-view class="video-scroll" scroll-y refresher-enabled @refresherrefresh="handleRefresher"
      :refresher-triggered="isTriggered" @scrolltolower="handleToLower">
      <view class="video-item" v-for="(item,index) in videoList" :key="index">
        <video :src="item.data.videoUrl" class="video" v-if="videoId == item.data.vid" :poster="item.data.coverUrl"
          autoplay="true" objectFit="cover"  @play="handlePlay(item.data.vid)" @timeupdate="handleTimeUpdate($event,item.data.vid)" :id="item.data.vid"
           @ended="handleEnded(item.data.vid)"></video>
        <!-- 性能优化：使用封面图片代替video -->
        <image :src="item.data.coverUrl" class="video" v-else @click="handlePlay(item.data.vid)"></image>

        <view class="content">{{item.data.title}}</view>

        <view class="footer">
          <image class="avatar" :src="item.data.creator.avatarUrl"></image>
          <text class="nickName">{{item.data.creator.nickname}}</text>
          <view class="comments-praised">
            <text class="item">
              <text class="iconfont icon-like1"></text>
              <text class="count">{{item.data.praisedCount}}</text>
            </text>
            <text class="item">
              <text class="iconfont icon-message3"></text>
              <text class="count">{{item.data.commentCount}}</text>
            </text>
            <button open-type="share" class="item btn">
              <text class="iconfont icon-more1"></text>
            </button>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        videoGroupList: [], // 视频导航标签
        navId: '', // 当前导航id
        videoList: [],
        videoId: '', // 当前视频id
        videoPlayTime: [], // 记录所有video的播放时长，数组内为包含time和vid属性的对象
        isTriggered: false, // 记录下拉刷新是否被触发
        offset:0, // 记录分页
      }
    },
    onLoad() {
      this.getVideoGroupList()
    },
    onShareAppMessage({from}) {
      if(from === 'button'){
        return {
          title:'转发当前视频',
          page:'pages/video/video',
          imageUrl:'/static/images/nvsheng.jpg'
        }
      }else{
        return {
          title:'转发当前页面',
          page:'pages/video/video',
          imageUrl:'/static/images/nvsheng.jpg'
        }
      }
    },
    methods: {
      async getVideoGroupList() {
        let result = await this.$request({
          url: '/video/group/list'
        })
        if (result.code == 200) {
          this.videoGroupList = result.data.slice(0, 14)
          this.navId = this.videoGroupList[0].id
          // 获取视频数据
          this.getVideoList(this.navId,this.offset)
        }
      },
      changeNav(id) {
        this.navId = id
        //  清空视频列表，这样切换时不会出现缓存的数据
        this.videoList = []
        // 显示正在加载
        uni.showLoading({
          title: '正在加载'
        })
        this.getVideoList(this.navId,this.offset)
      },
      // 获取对应的分类下的视频列表
      async getVideoList(id, offset) {
        let result = await this.$request({
          url: '/video/group',
          data: {
            id,
            offset
          }
        })
        // 隐藏加载
        uni.hideLoading()
        if (result.code == 200) {
          let videos = result.datas.map(item => {
            // 给视频列表数组的每一项添加videoUrl
            this.getVideoUrl(item.data.vid).then(res => {
              this.$set(item.data, 'videoUrl', res)
            })
            return item
          })
          this.videoList.push(...videos)
          // 数据加载完毕后设置下拉刷新未被触发
          this.isTriggered = false
        }
      },
      // 通过ID获取视频的播放地址
      async getVideoUrl(id) {
        let videoUrl = await this.$request({
          url: '/video/url',
          data: {
            id
          }
        })
        return videoUrl.urls[0].url
      },
      handlePlay(vid) {
        this.videoId = vid
        /* 判断当前视频是否播放过，如果播放过，从上次暂停的位置开始播放*/
        // 创建控制video标签的实例对象
        this.videoContext = uni.createVideoContext(this.videoId)
        let videoItem = this.videoPlayTime.find(item => item.vid === vid)
        if (videoItem) {
          this.videoContext.seek(videoItem.currentTime)
        }
        this.videoContext.play()
      },
      // 记录视频播放时长
      handleTimeUpdate(event, vid) {
        let videoTimeObj = {
          vid,
          currentTime: event.detail.currentTime
        }
        /* 往videoPlayTime中添加对象时应该区分两种情况：
            1. 如果数组中已有该视频播放记录，那么更新播放时间为最新时间
            2. 如果数组中没有，那么添加该对象
        */
        let {
          videoPlayTime
        } = this
        let videoItem = videoPlayTime.find(item => item.vid === videoTimeObj.vid)
        if (videoItem) {
          videoItem.currentTime = videoTimeObj.currentTime  
        } else {
          videoPlayTime.push(videoTimeObj)
        }
      },
      // 播放结束时从videoPlayTime中移除播放记录
      handleEnded(vid) {
        let index = this.videoPlayTime.findIndex(item => item.vid === vid)
        this.videoPlayTime.splice(index, 1)
      },
      // 自定义下拉刷新
      handleRefresher() {
        this.isTriggered = true
        this.getVideoList(this.navId)
      },
      // 自定义上拉触底
      handleToLower(){
        this.offset = this.offset + 1
        this.getVideoList(this.navId, this.offset)
      },
      toSearch(){
        uni.navigateTo({
          url:'/pages/search/search'
        })
      }
    }
  }
</script>

<style lang="scss">
  .video-container {
    .header {
      padding: 10rpx;
      display: flex;

      image {
        width: 60rpx;
        height: 60rpx;
      }

      .search {
        flex: 1;
        border: 1rpx solid #eee;
        margin: 0 10rpx;
        padding: 0 10rpx;
        font-size: 26rpx;
        line-height: 60rpx;
        text-align: center;
        color: $music-color;
      }
    }

    .nav-scroll {
      display: flex;
      white-space: nowrap;
      height: 70rpx;

      .nav-item {
        padding: 0 30rpx;
        font-size: 28rpx;
        height: 60rpx;
        line-height: 60rpx;

        .active {
          border-bottom: 1px solid $music-color;
        }
      }
    }

    .video-scroll {
      height: calc(100vh - 150rpx);

      .video-item {
        padding: 0 3%;

        .video {
          width: 100%;
          height: 360rpx;
          border-radius: 10rpx;
        }

        .content {
          font-size: 26rpx;
          height: 80rpx;
          line-height: 80rpx;
          max-width: 500rpx;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .footer {
          border-top: 1rpx solid #eee;
          padding: 20rpx 0;
          position: relative;

          .avatar {
            width: 60rpx;
            height: 60rpx;
            border-radius: 50%;
            vertical-align: middle;
          }

          .nickName {
            font-size: 26rpx;
            vertical-align: middle;
            margin-left: 20rpx;
          }

          .comments-praised {
            position: absolute;
            top: -6rpx;
            right: 0;

            .item {
              margin-left: 50rpx;
              position: relative;

              .count {
                position: absolute;
                top: -20rpx;
                font-size: 20rpx;
              }
            }

            .btn {
              display: inline;
              padding: 0;
              background-color: transparent;
              border-color: transparent;
            }

            .btn:after {
              border: none;
            }
          }
        }
      }
    }
  }
</style>
