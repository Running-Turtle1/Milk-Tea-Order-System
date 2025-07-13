<script>
	export default {
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import url('./static/icons/iconfont.css');
	
	/* 全局样式 */
	page {
		background-color: #121212;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
		color: #ffffff;
		overflow: hidden;
	}
	
	/* 隐藏所有滚动条 */
	::-webkit-scrollbar {
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		background: transparent !important;
	}
	
	/* 让所有可滚动元素都隐藏滚动条但保持可滚动 */
	page,
	view,
	scroll-view,
	.scroll-view,
	.uni-scroll-view,
	.scrollable,
	.uni-scroll-view-content {
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE 10+ */
	}
	
	/* 隐藏iOS上的滚动条 */
	::-webkit-scrollbar {
		width: 0 !important;
		height: 0 !important;
		background-color: transparent !important;
		display: none !important;
	}
	
	/* 确保内容可以滚动但不显示滚动条 */
	.uni-page-body,
	.uni-page-head,
	.uni-page-wrapper {
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	
	/* 为浮动导航栏添加深色背景 */
	.uni-navbar {
		background-color: #1a1a1a !important;
	}
	
	.uni-navbar__header {
		background-color: #1a1a1a !important;
	}
	
	.uni-navbar__header-btns {
		color: #ffffff !important;
	}
	
	.uni-navbar__header-title {
		color: #ffffff !important;
	}
	
	/* 导航按钮图标设置为白色 */
	.uni-navbar__header-btns-left,
	.uni-navbar__header-btns-right {
		color: #ffffff !important;
	}
	
	.uni-navbar__header-container {
		color: #ffffff !important;
	}
	
	.uni-nav-bar-text,
	.uni-nav-bar .uni-icon {
		color: #ffffff !important;
	}
	
	/* 导航栏上的所有图标和文字设置为白色 */
	.uni-navbar .uni-icon,
	.uni-navbar text,
	.uni-navbar view {
		color: #ffffff !important;
	}
	
	/* 返回箭头设置为白色 */
	.uni-navbar .uni-icon-back,
	.uni-navbar .uni-icon-left {
		color: #ffffff !important;
	}
	
	/* 确保tabbar底部没有白条 */
	.uni-tabbar {
		background-color: #1a1a1a !important;
		border-top-color: #2a2a2a !important;
	}
</style>
