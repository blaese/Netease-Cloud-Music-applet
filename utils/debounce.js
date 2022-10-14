// 防抖函数：在delay时间内触发事件，会取消定时器，从而不调用func响应函数
export function debounce (func, delay) {
	let timer = null
	return function (...args) {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, delay)
	}
}