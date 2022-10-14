<template>
  <view class="personal-container">
    <!-- 上半部分：个人信息 -->
    <view class="user-section">
      <image class="bg" src="/static/images/personal/bgImg2.jpg"></image>
      <view class="user-info-box" @click="toLogin">
        <view class="portrait-box">
          <image class="portrait" :src="userInfo.avatarUrl || '/static/images/personal/missing-face.png'"></image>
        </view>
        <view class="info-box">
          <text class="username">{{userInfo.nickname || '游客'}}</text>
        </view>
      </view>
      <view class="vip-card-box">
        <image class="card-bg" src="/static/images/personal/vip-card-bg.png"></image>
        <view class="b-btn">立即开通</view>
        <view class="title">
          <text class="iconfont icon-vip"></text>
          <text>网易云会员</text>
        </view>
        <text class="e-m">开启会员之路</text>
        <text class="e-b">开通会员获超21项特权</text>
      </view>
    </view>

    <!-- 下半部分 -->
    <view class="cover-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"
      :style="'transform:' + coverTransform + ';transition:' + coverTransition">
      <image class="arc" src="/static/images/personal/arc.png"></image>
      <!-- 个人中心导航 -->
      <view class="nav-section">
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-xiaoxitongzhi"></text>
          <text>我的消息</text>
        </view>
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-31haoyou"></text>
          <text>我的好友</text>
        </view>
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-geren"></text>
          <text>个人主页</text>
        </view>
        <view class="nav-item" hover-class="common-hover" hover-stay-time="50">
          <text class="iconfont icon-icon-"></text>
          <text>个性装扮</text>
        </view>
      </view>
      <!-- 个人中心列表 -->
      <view class="personal-content">
        <view class="recent-play-container">
          <text class="title">最近播放</text>
          <!-- 最近播放记录 -->
          <scroll-view scroll-x class="recent-scroll" enable-flex v-if="recentPlayList.length">
            <view class="recent-item" v-for="item in recentPlayList" :key="item.song.id">
              <image :src="item.song.al.picUrl"></image>
            </view>
          </scroll-view>
          <view class="notice" v-else>暂无播放记录</view>
        </view>

        <view class="card-list">
          <view class="card-item">
            <text class="title">我的音乐</text>
            <text class="more"> > </text>
          </view>
          <view class="card-item">
            <text class="title">我的收藏</text>
            <text class="more"> > </text>
          </view>
          <view class="card-item">
            <text class="title">我的电台</text>
            <text class="more"> > </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        startY: 0, // 手指开始位置
        moveY: 0, // 手指移动的实时位置
        moveDistance: 0, // 手指移动距离
        coverTransform: 'translateY(0)', // 盒子移动距离
        coverTransition: '', // 盒子过渡效果
        userInfo: {}, // 用户信息
        recentPlayList: [] // 用户最近播放记录
      }
    },
    onLoad() {
      let userInfoData = uni.getStorageSync('userInfo')
      if (userInfoData) {
        this.userInfo = JSON.parse(userInfoData)
        // 获取用户播放记录
        this.getUserPlayList(this.userInfo.userId)
      }
    },
    methods: {
      handleTouchStart(event) {
        this.coverTransition = ''
        this.startY = event.touches[0].clientY
      },
      handleTouchMove(event) {
        this.moveY = event.touches[0].clientY
        this.moveDistance = this.moveY - this.startY
        if (this.moveDistance < 0) {
          return
        }
        if (this.moveDistance > 80) {
          this.moveDistance = 80
        }
        this.coverTransform = `translateY(${this.moveDistance}rpx)`
      },
      handleTouchEnd(event) {
        this.coverTransform = 'translateY(0)'
        this.coverTransition = 'all .5s linear'
      },
      toLogin() {
        uni.navigateTo({
          url: '/pages/login/login'
        })
      },
      async getUserPlayList(uid) {
        let result = await this.$request({
          url: '/user/record',
          data: {
            uid,
            type: 0
          }
        })
        this.recentPlayList = result.allData.splice(0, 10)
      }
    }
  }
</script>

<style lang="scss">
  .personal-container {
    width: 100%;
    height: 100%;
    background: #f5f5f5;

    .user-section {
      position: relative;
      height: 520rpx;
      padding: 100rpx 30rpx 0;

      .bg {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0.7;
        filter: blur(1px);
      }

      .user-info-box {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        height: 180rpx;

        .portrait {
          width: 130rpx;
          height: 130rpx;
          border: 5rpx solid #fff;
          border-radius: 50%;
          margin-right: 20rpx;
        }

        .username {
          font-size: 24;
          color: #303133;
        }
      }
    }

    .vip-card-box {
      display: flex;
      flex-direction: column;
      position: relative;
      height: 240rpx;
      color: #f7d680;
      background: rgba(0, 0, 0, .7);
      border-radius: 16px 16px 0 0;
      padding: 20rpx 24rpx;

      .card-bg {
        position: absolute;
        top: 20rpx;
        right: 0;
        width: 380rpx;
        height: 260rpx;
      }

      .b-btn {
        position: absolute;
        top: 16rpx;
        right: 20rpx;
        width: 132rpx;
        height: 40rpx;
        text-align: center;
        line-height: 40rpx;
        font-size: 22rpx;
        color: #36343c;
        border-radius: 20rpx;
        background: #f9e6af;
        z-index: 1;
      }

      .title {
        display: flex;
        align-items: center;
        font-size: 22rpx;
        color: #f7d680;
        margin-bottom: 28rpx;

        .iconfont {
          color: #f6e5a3;
          margin-right: 16rpx;
        }
      }

      .e-m {
        font-size: 34rpx;
        margin-top: 10rpx;
      }

      .e-b {
        font-size: 24rpx;
        margin-top: 10rpx;
        color: #d8cba9;
      }
    }

    .cover-container {
      margin-top: -150rpx;
      padding: 0 30rpx 20rpx;
      position: relative;
      background: #f5f5f5;

      .arc {
        position: absolute;
        left: 0;
        top: -34rpx;
        width: 100%;
        height: 36rpx;
      }

      .nav-section {
        display: flex;
        background: #fff;
        padding: 20rpx 0;
        border-radius: 15rpx;

        .nav-item {
          width: 25%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;

          .iconfont {
            font-size: 50rpx;
            color: #d43c33;
            line-height: 70rpx;
          }

          text:last-child {
            font-size: 22rpx;
          }
        }
      }

      .personal-content {
        background: #fff;
        margin-top: 20rpx;

        .recent-play-container {

          .title {
            padding-left: 20rpx;
            font-size: 26rpx;
            color: #333;
            line-height: 80rpx;
          }

          .recent-scroll {
            display: flex;
            height: 200rpx;

            .recent-item {
              margin-left: 20rpx;

              image {
                width: 200rpx;
                height: 200rpx;
                border-radius: 10rpx;
              }
            }
          }

          .notice {
            margin-left: 20rpx;
            font-size: 34rpx;
          }
        }

        .card-list {
          margin-top: 20rpx;

          .card-item {
            border-top: 1rpx solid #eee;
            height: 80rpx;
            line-height: 80rpx;
            padding: 10rpx;
            font-size: 26rpx;
            color: #333;

            .more {
              float: right;
            }
          }
        }
      }
    }
  }
</style>
