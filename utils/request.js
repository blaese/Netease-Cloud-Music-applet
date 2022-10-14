const BASE_URL = 'http://localhost:3000'

export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header:{
        cookie:uni.getStorageSync('cookies') ? uni.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        if(res.cookies.length){
          uni.setStorage({
            key:'cookies',
            data:res.cookies
          })
        }
        resolve(res.data)
      },
      fail: (err) => {
        uni.showToast({
          title: '请求接口失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}
