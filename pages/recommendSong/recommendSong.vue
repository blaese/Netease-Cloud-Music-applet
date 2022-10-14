<template>
  <view class="recommend-song-container">
    <!-- 头部区域 -->
    <view class="header">
      <image src="/static/images/recommendSong/recommendSong.jpg"></image>
      <view class="date">
        <text class="day">{{day}} /</text>
        <text class="month">{{month}}</text>
      </view>
    </view>
    <!-- 列表区域 -->
    <view class="list-container">
      <view class="list-header">
        <text>播放全部</text>
        <text class="multiple-choice">多选</text>
      </view>
      <!-- 歌曲列表 -->
      <scroll-view scroll-y class="list-scroll">
        <view class="scroll-item" v-for="(item,index) in recommendList" :key="item.id" @click="toSongDetail(item.id,index)">
          <image :src="item.al['picUrl']"></image>
          <view class="music-info">
            <text class="music-name">{{item.name}}</text>
            <text class="singer">{{item.ar[0].name}}</text>
          </view>
          <text class="iconfont icon-more2"></text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        day:'',
        month:'',
        recommendList:[],
        index:0, // 点击音乐的索引数
      }
    },
    onLoad() {
      let userInfo = uni.getStorageSync('userInfo')
      if(!userInfo){
        uni.showToast({
          title:'请先登录',
          icon:'none',
          success: () => {
            uni.reLaunch({
              url:'/pages/login/login'
            })
          }
        })
      } 
      this.day = new Date().getDate().toString().padStart(2,'0')
      this.month = (new Date().getMonth() + 1).toString().padStart(2,'0')
      this.getRecommendList()
      
      this.$bus.$on('switchSong',(type) => {
        if(type == 'pre'){
          if(this.index == 0){
            // 跳转到最后一首
            this.index = this.recommendList.length - 1
          }else{
            this.index--
          }
        }else{
          if(this.index == this.recommendList.length - 1){
            this.index = 0
          }else{
            this.index++
          }
        }
        let musicId = this.recommendList[this.index].id
        this.$bus.$emit('musicId', musicId)
      })
    },
    methods: {
      async getRecommendList(){
        let result = await this.$request({
          url:'/recommend/songs'
        })
        this.recommendList = result.data['dailySongs']
      },
      toSongDetail(id,index){
        this.index = index
        uni.navigateTo({
          url:'/pages/songDetail/songDetail?musicId=' + id
        })
      }
    }
  }
</script>

<style lang="scss">
.recommend-song-container{
  .header{
    position: relative;
    width: 100%;
    height: 300rpx;
    
    image{
      width: 100%;
      height: 100%;
    }
    
    .date{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      width: 300rpx;
      height: 100rpx;
      text-align: center;
      line-height: 100rpx;
      color: #fff;
      
      .day{
        display: inline-block;
        font-size: 46rpx;
        margin-right: 10rpx;
      }
    }
  }
  
  .list-container{
    position: relative;
    top: -20rpx;
    background-color: #fff;
    border-radius: 30rpx;
    padding: 0 20rpx;
    
    .list-header{
      height: 80rpx;
      line-height: 80rpx;
      
      .multiple-choice{
        float: right;
      }
    }
    
    .list-scroll{
      height: calc(100vh - 380rpx);
      
      .scroll-item{
        display: flex;
        margin-bottom: 20rpx;
        
        image{
          width: 80rpx;
          height: 80rpx;
          margin-right: 20rpx;
          border-radius: 8rpx;
        }
        
        .music-info{
          flex: 1;
          display: flex;
          flex-direction: column;
          
          text{
            line-height: 40rpx;
            font-size: 24rpx;
            max-width: 500rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        
        .iconfont{
          width: 80rpx;
          height: 80rpx;
          text-align: right;
          line-height: 80rpx;
        }
      }
    }
  }
}
</style>
