# Milk Tea Order System
## 项目介绍

奶茶点单系统是一个全栈开发的电商项目，专为奶茶店设计，支持线上点单、会员管理、营销活动等功能。系统包含三个主要部分：后端服务、管理员前端和客户端小程序。

项目基于 uniapp + vue3 + springboot 开发，支持小程序+网页端+安卓端多端部署。

项目演示视频地址：https://www.bilibili.com/video/BV1veuwzgEzX/

## 系统架构

### 三端架构

1. **后端服务**（milktea目录）：基于Spring Boot的RESTful API服务
2. **管理员前端**（milktea-vue3目录）：基于Vue 3的Web管理后台
3. **客户端小程序**（milktea-uniapp目录）：基于uni-app的多平台客户端应用

## 技术栈

### 后端技术栈

- **框架**：Spring Boot 3.4.4
- **语言**：Java 17
- **ORM**：Spring Data JPA
- **安全**：Spring Security + JWT
- **数据库**：MySQL 8.0
- **缓存**：Redis

### 管理端技术栈

- **框架**：Vue 3
- **构建工具**：Vite
- **UI组件**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router
- **HTTP客户端**：Axios
- **图表**：Echarts

### 客户端技术栈

- **框架**：uni-app
- **平台**：微信小程序（可扩展到其他平台）

## 功能模块

### 用户端功能

- **用户认证**：登录、注册、密码找回
- **商品浏览**：分类展示、商品详情、搜索
- **购物车**：添加商品、调整规格、配料添加
- **订单管理**：创建订单、支付、查看订单状态
- **会员中心**：积分查询、签到、会员等级
- **优惠券**：领取优惠券、使用优惠券
- **个人中心**：地址管理、账户设置

### 管理端功能

- **数据统计**：销售额、订单量、用户增长统计
- **商品管理**：商品添加、编辑、上下架
- **分类管理**：商品分类管理
- **规格管理**：定义商品规格、配料选项
- **订单管理**：订单处理、状态更新、退款管理
- **会员管理**：会员信息、消费记录
- **优惠券管理**：创建优惠券、设置规则
- **系统设置**：店铺信息设置、权限管理

## 数据库设计

系统包含以下主要数据表：

- **用户表**（user）：存储用户基本信息
- **管理员表**（admin）：存储管理员信息
- **商品表**（product）：存储商品信息
- **分类表**（category）：存储商品分类
- **规格表**（specification）：存储商品规格信息
- **配料表**（ingredient）：存储可选配料信息
- **订单表**（order）：存储订单主信息
- **订单详情表**（order_detail）：存储订单商品明细
- **购物车表**（cart）：存储用户购物车信息
- **优惠券表**（coupon）：存储优惠券模板信息
- **用户优惠券表**（user_coupon）：存储用户领取的优惠券
- **积分记录表**（point_record）：存储用户积分变动记录
- **会员等级表**（member_level）：存储会员等级配置
- **签到表**（checkin）：存储用户签到记录
- **店铺信息表**（shop_info）：存储店铺基本信息

## 项目启动

### 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 3.2+
- Node.js 16+
- npm 8+

### 数据库导入步骤

1. 创建数据库

   ```sql
   CREATE DATABASE milk_tea_ordering DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. 导入数据
   **使用MySQL客户端工具导入:**

   - **Navicat**:
     1. 连接到MySQL服务器
     2. 右键点击已创建的`milk_tea_ordering`数据库
     3. 选择"运行SQL文件"
     4. 浏览并选择项目中的`milk_tea_ordering.sql`文件
     5. 点击"开始"执行导入

   - **MySQL Workbench**:
     1. 连接到MySQL服务器
     2. 选择已创建的`milk_tea_ordering`数据库
     3. 点击菜单栏中的"文件" -> "打开SQL脚本"
     4. 选择项目中的`milk_tea_ordering.sql`文件
     5. 点击"执行"按钮(闪电图标)导入数据

   - **phpMyAdmin**:
     1. 登录phpMyAdmin
     2. 选择已创建的`milk_tea_ordering`数据库
     3. 点击顶部菜单的"导入"选项卡
     4. 浏览并选择`milk_tea_ordering.sql`文件
     5. 点击底部的"执行"按钮

3. 配置数据库连接
   修改后端配置文件 `milktea/src/main/resources/application.yml` 中的数据库连接信息：

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/milk_tea_ordering?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
       username: 你的数据库用户名
       password: 你的数据库密码
   ```

### 初始数据说明

导入SQL后，系统自带以下初始数据：

1. **管理员账号**
   - 用户名：admin
   - 密码：$2a$10$uPhhCSjDghrIBIg5k.I6QesR...（加密存储）
   - 默认密码为：123456

2. **测试用户**
   - 系统预置了多个测试用户账号
   - 所有测试用户默认密码：123456

3. **商品数据**
   - 系统预置了21款奶茶商品
   - 分为5个分类：人气热卖、水果茶、奶茶系列、咖啡系列、特调饮品

4. **会员等级**
   - 普通会员（0级）：无折扣
   - 银卡会员（1级）：9.5折优惠
   - 金卡会员（2级）：9折优惠
   - 黑卡会员（3级）：8.5折优惠

5. **优惠券数据**
   - 系统预置了9种优惠券模板

### 后端启动

1. 使用IntelliJ IDEA/Eclipse等Java IDE打开milktea目录
2. 配置Maven环境和JDK版本
3. 更新Maven依赖
4. 运行MilkteaApplication主类启动服务

### 管理端启动

1. 使用VS Code或WebStorm打开milktea-vue3目录
2. 在编辑器终端中执行npm install安装依赖
3. 点击VS Code中的运行配置或通过终端执行npm run dev
4. 在浏览器中访问控制台显示的地址

### 客户端启动

1. 使用HBuilderX打开milktea-uniapp目录
2. 在编辑器中安装依赖(HBuilderX → 菜单 → 运行 → 运行到终端，执行npm install)
3. 点击工具栏的"运行"按钮，选择需要运行的平台:
   - 运行到浏览器
   - 运行到小程序模拟器
   - 运行到手机或模拟器