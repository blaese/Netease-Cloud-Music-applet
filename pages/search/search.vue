<template>
  <view class="search-container">
    <!-- 头部区域 -->
    <view class="header">
      <view class="search-input">
        <text class="search-icon iconfont icon-search"></text>
        <input type="text" :placeholder="placeholderContent" placeholder-class="placeholder" @input="handleInput" :value="keywords" />
        <text class="clear iconfont icon-delete2" @click="clearKeywords"></text>
      </view>
      <text class="cancel">取消</text>
    </view>

    <!-- 展示搜索内容区域 -->
    <view class="show-search" v-if="keywords.length > 0">
      <view class="search-keywords">搜索内容：{{keywords}}</view>
      <view class="search-list">
        <view class="search-item" v-for="(item, index) in searchList" :key="index">
          <text class="iconfont icon-search" ></text>
          <text class="content">{{item.name}}</text>
        </view>
      </view>
    </view>

    <view v-else>
      <!-- 搜索历史 -->
      <view class="search-history" v-if="historyList.length > 0">
        <view class="history">历史</view>
        <view class="history-item" v-for="(item, index) in historyList" :key="index">
          {{item}}
        </view>
        <text class="iconfont icon-delete delete" @click="deleteSearchHistory"></text>
      </view>
      <!-- 热搜榜区域 -->
      <view class="hot-container">
        <view class="title">热搜榜</view>
        <view class="hot-list">
          <view class="hot-item" v-for="(item, index) in hotList" :key="index">
            <text class="order">{{index + 1}}</text>
            <text>{{item.searchWord}}</text>
            <image v-if="item.iconUrl" :src="item.iconUrl" class="icon-img"></image>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
  import {
    debounce
  } from '@/utils/debounce.js'

  export default {
    data() {
      return {
        placeholderContent: '',
        hotList: [],
        keywords: '',
        searchList: [],
        historyList: []
      }
    },
    onLoad() {
      this.getInitData()
      // 调用获取历史记录
      this.getSearchHistory()
    },
    methods: {
      async getInitData() {
        let placeholderData = await this.$request({
          url: '/search/default'
        })
        this.placeholderContent = placeholderData.data.showKeyword
        let hotListData = await this.$request({
          url: '/search/hot/detail'
        })
        this.hotList = hotListData.data
      },
      // 搜索内容发生改变的回调
      handleInput(event) {
        this.keywords = event.detail.value.trim()
        this.searchChange()
      },
      // 获取搜索内容的回调
      async getSearchList() {
        if (!this.keywords) {
          this.searchList = []
          return;
        }
        // 发请求获取关键字模糊匹配数据
        let searchListData = await this.$request({
          url: '/search',
          data: {
            keywords: this.keywords,
            limit: 10
          }
        })
        this.searchList = searchListData.result.songs
        // 将搜索的关键字添加到搜索历史记录中
        if (this.historyList.indexOf(this.keywords) !== -1) {
          this.historyList.splice(this.historyList.indexOf(this.keywords), 1)
        }
        this.historyList.unshift(this.keywords)
        uni.setStorageSync('searchHistory', this.historyList)
      },
      // 获取搜索历史
      getSearchHistory() {
        let historyList = uni.getStorageSync('searchHistory')
        if (historyList) {
          this.historyList = historyList
        }
      },
      /* 
       不能写成 searchChange(){
         debounce(function(){
           this.getSearchList()
         },500)
       }，否则无法起到节流效果
       防抖函数就是一个闭包；它返回的是一个函数，然后你又去执行这个函数
       相当于立即执行函数 debounce返回的是一个函数然后里面执行就形成了闭包
       由于每次触发input事件都会返回一个新的匿名函数， 就会生成一个新的函数执行期上下文(称之为执行栈),所以就会防抖失效
       因此在vue按钮中想要使用防抖和节流应该直接使用而不是在方法内使用，必须写成如下形式
       */
      searchChange: debounce(function() {
        this.getSearchList()
      }, 500),
      // 删除历史记录
      deleteSearchHistory(){
        uni.showModal({
          content:'确定删除历史记录吗?',
          success: (res) => {
            if(res.confirm){
              this.historyList = []
              uni.removeStorageSync('searchHistory')
            }
          }
        })
      },
      // 清空搜索内容
      clearKeywords(){
        this.keywords = ''
        this.searchList = []
      }
    }
  }
</script>

<style lang="scss">
  .search-container {
    padding: 0 20rpx;

    .header {
      display: flex;
      height: 60rpx;
      line-height: 60rpx;
      padding: 10rpx 0;

      .search-input {
        position: relative;
        flex: 1;
        background: rgba(237, 237, 237, 0.3);
        border-radius: 30rpx;

        .search-icon {
          position: absolute;
          left: 15rpx;
        }

        input {
          margin-left: 60rpx;
          height: 60rpx;
        }

        .placeholder {
          font-size: 28rpx;
        }

        .clear {
          position: absolute;
          right: 30rpx;
          top: 0;
          z-index: 10;
        }
      }

      .cancel {
        width: 100rpx;
        text-align: center;
      }
    }

    .show-search {
      .search-keywords {
        height: 80rpx;
        color: $music-color;
        line-height: 80rpx;
        border-bottom: 1px solid $music-color;
        font-size: 24rpx;
      }

      .search-list {
        .search-item {
          display: flex;
          height: 80rpx;
          line-height: 80rpx;

          .content {
            flex: 1;
            margin-left: 20rpx;
            border-bottom: 1px solid #eee;
            font-size: 26rpx;
          }
        }
      }
    }

    .search-history {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      line-height: 50rpx;
      margin: 20rpx 0;

      .history {
        height: 50rpx;
        font-size: 28rpx;
      }

      .history-item {
        height: 50rpx;
        font-size: 26rpx;
        padding: 0 30rpx;
        background-color: #ededed;
        border-radius: 20rpx;
        margin: 0 0 20rpx 20rpx;
      }

      .delete {
        position: absolute;
        bottom: 20rpx;
        right: 15rpx;
      }
    }

    .hot-container {
      margin-top: 30rpx;

      .title {
        font-size: 28rpx;
        height: 80rpx;
        line-height: 80rpx;
        border-bottom: 1px solid #eee;
      }

      .hot-list {
        display: flex;
        flex-wrap: wrap;

        .hot-item {
          width: 50%;
          height: 80rpx;
          line-height: 80rpx;
          font-size: 26rpx;

          .order {
            margin: 0 10rpx;
          }

          .icon-img {
            width: 35rpx;
            height: 20rpx;
            margin-left: 10rpx;
          }
        }
      }
    }
  }
</style>
