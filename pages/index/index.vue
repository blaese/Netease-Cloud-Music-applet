<template>
	<view class="index-container">
		<!-- 轮播图区域 -->
    <swiper class="banners" indicator-dots indicator-color="ivory" indicator-active-color="#d43c33" autoplay="true">
      <swiper-item v-for="swiper in bannerList" :key="swiper.targetId">
        <image :src="swiper.imageUrl || swiper.pic" ></image>
      </swiper-item>
    </swiper>
    <!-- 图标导航区域 -->
    <view class="nav-container">
      <view class="nav-item" @click="toRecommendSong">
        <text class="iconfont icon-rili"></text>
        <text class="nav">每日推荐</text>
      </view>
      <view class="nav-item">
        <text class="iconfont icon-yinleyule"></text>
        <text class="nav">歌单</text>
      </view>
      <view class="nav-item">
        <text class="iconfont icon-paixingbang"></text>
        <text class="nav">排行榜</text>
      </view>
      <view class="nav-item">
        <text class="iconfont icon-luyinjishouyinjidiantai"></text>
        <text class="nav">电台</text>
      </view>
      <view class="nav-item">
        <text class="iconfont icon-zhibo"></text>
        <text class="nav">直播</text>
      </view>
    </view>
    <!-- 推荐歌单区域 -->
    <view class="recommend-container">
      <!-- 标题 -->
      <nav-header title="推荐歌曲"></nav-header>
      <!-- 推荐歌曲内容 -->
      <scroll-view class="recommend-song" scroll-x enable-flex>
        <view class="scroll-item" v-for="item in recommendList" :key="item.id">
          <image :src="item.picUrl"></image>
          <text>{{item.name}}</text>
        </view>
      </scroll-view>
    </view>
    <!-- 排行榜区域 -->
    <view class="top-list">
      <nav-header title="排行榜"></nav-header>
      <!-- 内容区域 -->
      <swiper next-margin="50rpx">
        <swiper-item v-for="rank in topList" :key="rank.name">
          <view class="swiper-item">
            <view class="title">{{rank.name}}</view>
            <view class="music-item" v-for="(item, index) in rank.tracks" :key="item.id">
              <image :src="item.al.picUrl"></image>
              <text class="count">{{index + 1}}</text>
              <text class="music-name">{{item.name}}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
	</view>
</template>

<script>
  import navHeader from '@/components/navHeader.vue'
  
	export default {
		data() {
			return {
        bannerList:[],
        recommendList:[],
        topList:[]
			}
		},
    components:{
      navHeader
    },
    async onLoad() {
      let bannerListData = await this.$request({
        url:'/banner',
        data:{
          type:2
        }
      })
      this.bannerList = bannerListData.banners
        
      let recommendListData = await this.$request({
        url:'/personalized',
        data:{
          limit:30
        }
      })
      this.recommendList = recommendListData.result
      
      // idx的取值范围是0-20，需要的是0-4，需要发送5次请求
      let topList = await this.$request({
        url:'/toplist'
      })
      for(let i = 0; i < 5; i++){
        let topListId = topList.list[i].id
        let topListData = await this.$request({
          url:'/playlist/detail',
          data:{
            id:topListId
          }
        })
        // 抽取需要的字段
        let topListItem = {
          name:topListData.playlist.name,
          tracks:topListData.playlist.tracks.slice(0,3)
        }
        this.topList.push(topListItem)
      }
    },
		methods: {
      toRecommendSong(){
        uni.navigateTo({
          url:'/pages/recommendSong/recommendSong'
        })
      }
		}
	}
</script>

<style lang="scss">
  .banners{
    width: 100%;
    height: 300rpx;
    
    image{
      width: 100%;
      height: 100%;
    }
  }
  
  .nav-container{
    display: flex;
    justify-content: space-evenly;
    
    .nav-item{
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .iconfont{
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      text-align: center;
      line-height: 100rpx;
      background-color: rgb(240, 19, 19);
      font-size: 50rpx;
      color: #fff;
      margin: 20rpx 0;
    }
    
    .nav{
      font-size: 26rpx;
    }
  }
  
  .recommend-container{
     padding: 10rpx 20rpx;
    
    .recommend-song{
      display: flex;
      margin-top: 10rpx;
      height: 300rpx;
      
      .scroll-item{
        width: 200rpx;
        margin-right: 10rpx;
        
        image{
          width: 200rpx;
          height: 200rpx;
          border-radius: 10rpx;
        }
        
        text{
          font-size: 26rpx;
          // 多行文本溢出隐藏
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical; // 设置对齐模式
          -webkit-line-clamp: 2;
        }
      }
    }
  }
  
  .top-list{
    padding: 10rpx 20rpx;
    border-top: 1px solid #eee;
    
    swiper{
      height: 450rpx;
      
      .swiper-item{
        background: #fbfbfb;
        
        .title{
          font-size: 30rpx;
          line-height: 80rpx;
        }
        
        .music-item{
          display: flex;
          margin-bottom: 20rpx;
          
          image{
            width: 100rpx;
            height: 100rpx;
            margin-right: 20rpx;
            border-radius: 6rpx;
          }
          
          .count{
            width: 100rpx;
            height: 100rpx;
            text-align: center;
            line-height: 100rpx;
            margin-right: 20rpx;
          }
          
          .music-name{
            height: 100rpx;
            line-height: 100rpx;
            font-size: 28rpx;
            min-width: 400rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
</style>
