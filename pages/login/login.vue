<template>
  <view class="container">
    <view class="wrapper">
      <view class="left-top-sign">LOGIN</view>
      <view class="welcome">
        欢迎回来！
      </view>
      <view class="input-content">
        <view class="input-item">
          <text class="tit">手机号码</text>
          <input type="text" placeholder="请输入手机号码" v-model="phone" />
        </view>
        <view class="input-item">
          <text class="tit">密码</text>
          <input type="password" placeholder="请输入密码" v-model="password" />
        </view>
      </view>
      <button class="confirm-btn" bindtap="login" @click="login">登录</button>
      <view class="forget-section">
        忘记密码?
      </view>
    </view>

    <view class="register-section">
      还没有账号?
      <text>马上注册</text>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        phone: '',
        password: ''
      }
    },
    methods: {
      async login() {
        // 1.前端验证
        const {
          phone,
          password
        } = this
        if (!phone) {
          uni.showToast({
            title: '手机号不能为空',
            icon: 'none'
          })
          return
        }
        let phoneReg = /^1[3456789]\d{9}$/
        if (!phoneReg.test(phone)) {
          uni.showToast({
            title: '手机号格式错误',
            icon: 'none'
          })
          return
        }

        if (!password) {
          uni.showToast({
            title: '密码不能为空',
            icon: 'none'
          })
          return
        }
        let passwordReg = /^(?![\d]+$)(?![a-zA-Z]+$)(?![^\da-zA-Z]+$).{8,20}$/
        if (!passwordReg.test(password)) {
          uni.showToast({
            title: '密码应该包含字母、数字、符号中至少两种，不能包含空格，长度为8-20位',
            icon: 'none'
          })
          return
        }
        // 2.后端验证
        let result = await this.$request({
          url: '/login/cellphone',
          data: {
            phone,
            password
          }
        })
        if (result.code === 200) {
          uni.showToast({
            title: '登录成功'
          })
          uni.setStorageSync('userInfo',JSON.stringify(result.profile))
          uni.reLaunch({
            url:'/pages/personal/personal'
          })
        } else if (result.code === 400) {
          uni.showToast({
            title: '手机号错误',
            icon: "none"
          })
        } else if (result.code === 502) {
          uni.showToast({
            title: '密码错误',
            icon: "none"
          })
        } else {
          uni.showToast({
            title: '登录失败，请重新登录',
            icon: "none"
          })
        }
      }
    }
  }
</script>

<style lang="scss">
  .wrapper {
    position: relative;
    z-index: 90;
    padding-bottom: 40rpx;

    .left-top-sign {
      font-size: 120rpx;
      color: #f8f8f8;
      position: relative;
      left: -16rpx;
    }

    .welcome {
      position: relative;
      left: 50rpx;
      top: -90rpx;
      font-size: 46rpx;
      color: #555;
    }

    .input-content {
      padding: 0 60rpx;

      .input-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding: 0 30rpx;
        background: #f8f6fc;
        height: 120rpx;
        border-radius: 4px;
        margin-bottom: 50rpx;

        .tit {
          height: 50rpx;
          line-height: 56rpx;
          font-size: 30rpx;
          color: #606266;
        }

        input {
          height: 60rpx;
          font-size: 30rpx;
          color: #303133;
          width: 100%;
        }
      }

      .input-item:last-child {
        margin-bottom: 0;
      }
    }

    .confirm-btn {
      width: 630rpx !important;
      height: 76rpx;
      line-height: 76rpx;
      border-radius: 50rpx;
      margin-top: 70rpx;
      background: #d43c33;
      color: #fff;
      font-size: 32rpx;
      padding: 0;
    }

    .forget-section {
      font-size: 28rpx;
      color: #4399fc;
      text-align: center;
      margin-top: 40rpx;
    }
  }

  .register-section {
    position: absolute;
    left: 0;
    bottom: 50rpx;
    width: 100%;
    font-size: 28rpx;
    color: #606266;
    text-align: center;

    text {
      color: #4399fc;
      margin-left: 10rpx;
    }
  }
</style>
