<template>
  <view class="header">
    <text class="title">{{title}}</text>
    <text class="more">></text>
  </view>
</template>

<script>
  export default {
    props:['title']
  }
</script>

<style lang="scss">
  .header{
    display: flex;
    justify-content: space-between;
    line-height: 80rpx;
    
    .title{
      font-size: 32rpx;
      font-weight: 700;
    }
    
    .more{
      color: 	#999;
    }
  }
</style>