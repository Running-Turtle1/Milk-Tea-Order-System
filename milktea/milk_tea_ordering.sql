/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80036
 Source Host           : localhost:3306
 Source Schema         : milk_tea_ordering

 Target Server Type    : MySQL
 Target Server Version : 80036
 File Encoding         : 65001

 Date: 27/05/2025 12:45:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `real_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像URL',
  `status` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '管理员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin
-- ----------------------------
INSERT INTO `admin` VALUES (1, 'admin', '$2a$10$uPhhCSjDghrIBIg5k.I6QesR.tFpiCXlKrZ/oWsONWy0NvDp3ot62', '系统管理员', NULL, NULL, 1, '2025-04-23 17:01:26', '2025-05-06 17:44:40');
INSERT INTO `admin` VALUES (2, 'manager1', '$2a$10$v7r7djqHgEyj0i9hUBOlFO.i20O.LhK.f7GcGY0j3cNYvskKyGM06', '高级门店经理', '13800138001', NULL, 1, '2025-04-30 22:22:45', '2025-05-06 17:44:40');

-- ----------------------------
-- Table structure for cart
-- ----------------------------
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `product_id` bigint(0) NOT NULL COMMENT '商品ID',
  `quantity` int(0) NOT NULL DEFAULT 1 COMMENT '数量',
  `temperature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `sweetness` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ingredients` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配料JSON格式，包含ID和名称',
  `total_price` decimal(10, 2) NOT NULL COMMENT '总价',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `selected` bit(1) NOT NULL,
  `attributes_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '规格属性哈希值',
  `ingredients_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配料组合哈希值',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_cart_unique`(`user_id`, `product_id`, `attributes_hash`, `ingredients_hash`) USING BTREE,
  INDEX `idx_user_product`(`user_id`, `product_id`) USING BTREE,
  INDEX `FK3d704slv66tw6x5hmbm6p2x3u`(`product_id`) USING BTREE,
  CONSTRAINT `FK3d704slv66tw6x5hmbm6p2x3u` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKl70asp4l4w0jmbm1tqyofho4o` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 127 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '购物车表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart
-- ----------------------------
INSERT INTO `cart` VALUES (8, 7, 10, 2, '热', '少糖', '[{\"id\":3,\"name\":\"珍珠\",\"price\":2.00}]', 40.00, '2025-04-23 23:32:15', '2025-04-27 12:50:50', b'1', 'a6e6208c4397d7ccb954e795bbc696dd', '79c7781f8035274f65e9dfe57068c411');
INSERT INTO `cart` VALUES (12, 2, 3, 1, '', '', NULL, 19.00, '2025-04-26 15:55:38', '2025-04-27 12:50:50', b'1', 'd41d8cd98f00b204e9800998ecf8427e', 'd41d8cd98f00b204e9800998ecf8427e');
INSERT INTO `cart` VALUES (13, 7, 3, 2, '', '', NULL, 38.00, '2025-04-26 21:06:11', '2025-04-27 12:50:50', b'1', 'd41d8cd98f00b204e9800998ecf8427e', 'd41d8cd98f00b204e9800998ecf8427e');
INSERT INTO `cart` VALUES (14, 7, 1, 1, '', '', NULL, 16.00, '2025-04-26 23:54:08', '2025-04-27 12:50:50', b'1', 'd41d8cd98f00b204e9800998ecf8427e', 'd41d8cd98f00b204e9800998ecf8427e');
INSERT INTO `cart` VALUES (108, 2, 1, 1, '热', '少糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2}]', 17.00, '2025-05-15 14:34:45', '2025-05-15 14:34:45', b'1', 'ff94dc92398b98f63d9c3164822cef02', '35dba5d75538a9bbe0b4da4422759a0e');

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类图片',
  `sort` int(0) NULL DEFAULT 0 COMMENT '排序权重',
  `status` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category
-- ----------------------------
INSERT INTO `category` VALUES (1, '人气热卖', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 1, 1, '2025-04-23 17:01:26', '2025-05-18 19:31:41');
INSERT INTO `category` VALUES (2, '水果茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 2, 1, '2025-04-23 17:01:26', '2025-05-18 19:31:41');
INSERT INTO `category` VALUES (3, '奶茶系列', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 3, 1, '2025-04-23 17:01:26', '2025-05-18 19:31:41');
INSERT INTO `category` VALUES (4, '咖啡系列', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 4, 1, '2025-04-23 17:01:26', '2025-05-18 19:31:41');
INSERT INTO `category` VALUES (5, '特调饮品', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 5, 1, '2025-04-23 17:01:26', '2025-05-18 19:31:41');

-- ----------------------------
-- Table structure for checkin
-- ----------------------------
DROP TABLE IF EXISTS `checkin`;
CREATE TABLE `checkin`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(0) NOT NULL,
  `checkin_date` date NOT NULL,
  `points` int(0) NULL DEFAULT NULL,
  `consecutive_days` int(0) NULL DEFAULT 1,
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `checkin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of checkin
-- ----------------------------
INSERT INTO `checkin` VALUES (1, 1, '2025-05-02', NULL, 1, '2025-05-02 18:31:44');
INSERT INTO `checkin` VALUES (2, 1, '2025-05-03', NULL, 2, '2025-05-03 00:06:36');
INSERT INTO `checkin` VALUES (3, 1, '2025-05-04', NULL, 3, '2025-05-04 16:25:06');
INSERT INTO `checkin` VALUES (4, 4, '2025-05-04', NULL, 1, '2025-05-04 18:32:01');
INSERT INTO `checkin` VALUES (5, 1, '2025-05-05', NULL, 4, '2025-05-05 16:04:03');
INSERT INTO `checkin` VALUES (6, 1, '2025-05-16', 2, 1, '2025-05-16 12:39:27');
INSERT INTO `checkin` VALUES (7, 1, '2025-05-18', 2, 1, '2025-05-18 18:08:33');

-- ----------------------------
-- Table structure for coupon
-- ----------------------------
DROP TABLE IF EXISTS `coupon`;
CREATE TABLE `coupon`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '优惠券ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` int(0) NOT NULL,
  `amount` decimal(10, 2) NOT NULL COMMENT '金额/折扣',
  `min_point` decimal(10, 2) NULL DEFAULT NULL COMMENT '使用门槛，0表示无门槛',
  `start_time` datetime(0) NOT NULL COMMENT '开始时间',
  `end_time` datetime(0) NOT NULL COMMENT '结束时间',
  `total` int(0) NULL DEFAULT NULL COMMENT '发放总量，NULL为不限量',
  `used` int(0) NULL DEFAULT 0 COMMENT '已使用数量',
  `status` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `issued` int(0) NULL DEFAULT NULL,
  `member_level` int(0) NOT NULL,
  `min_consumption` decimal(10, 2) NOT NULL,
  `per_limit` int(0) NULL DEFAULT NULL,
  `use_scope` int(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '优惠券表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coupon
-- ----------------------------
INSERT INTO `coupon` VALUES (1, '新用户5元券', 1, 5.00, 0.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 1000, 50, 1, '2025-04-23 19:53:46', '2025-05-04 11:15:03', NULL, 2, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (2, '满30减8元', 1, 8.00, 30.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 500, 120, 1, '2025-04-23 19:53:46', '2025-05-04 11:15:05', NULL, 3, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (3, '85折优惠券', 2, 0.85, 20.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 300, 45, 1, '2025-04-23 19:53:46', '2025-05-04 11:15:06', NULL, 4, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (4, '会员专享券', 1, 10.00, 50.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 200, 30, 1, '2025-04-23 19:53:46', '2025-05-04 11:15:07', NULL, 5, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (5, '新人立减券', 1, 10.00, 0.00, '2025-04-24 18:11:10', '2025-05-24 18:11:10', 1000, 4, 1, '2025-04-24 18:11:10', '2025-05-04 12:24:25', NULL, 15, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (6, '满50减15优惠券', 1, 15.00, 50.00, '2025-04-24 18:11:10', '2025-05-09 18:11:10', 500, 3, 1, '2025-04-24 18:11:10', '2025-05-04 12:24:28', NULL, 18, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (7, '满100减30优惠券', 1, 30.00, 100.00, '2025-04-24 18:11:10', '2025-05-14 18:11:10', 300, 2, 1, '2025-04-24 18:11:10', '2025-05-04 11:15:11', NULL, 8, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (8, '8.5折优惠券', 2, 0.85, 60.00, '2025-04-24 18:11:10', '2025-05-04 18:11:10', 200, 2, 1, '2025-04-24 18:11:10', '2025-05-04 09:19:21', NULL, 1, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (9, '8折优惠券', 2, 0.80, 120.00, '2025-04-24 18:11:10', '2025-05-19 18:11:10', 100, 2, 1, '2025-04-24 18:11:10', '2025-05-04 19:04:51', NULL, 11, 0, 0.00, NULL, 0);
INSERT INTO `coupon` VALUES (10, '新人无门槛5元劵', 1, 5.00, NULL, '2025-05-18 00:00:00', '2025-06-30 00:00:00', 100, 1, 1, '2025-05-18 18:06:31', '2025-05-18 18:11:15', '', 1, 0, 0.00, 1, 0);

-- ----------------------------
-- Table structure for ingredient
-- ----------------------------
DROP TABLE IF EXISTS `ingredient`;
CREATE TABLE `ingredient`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '配料ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL COMMENT '配料价格',
  `stock` int(0) NULL DEFAULT 0 COMMENT '库存',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sort` int(0) NULL DEFAULT 0 COMMENT '排序权重',
  `status` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '配料表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ingredient
-- ----------------------------
INSERT INTO `ingredient` VALUES (1, '珍珠', 2.00, 1000, '珍珠/芋圆', 0, 1, '2025-04-23 17:01:26', '2025-05-04 15:43:53');
INSERT INTO `ingredient` VALUES (2, '椰果', 2.00, 1000, '珍珠/芋圆', 0, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `ingredient` VALUES (3, '西米', 2.00, 1000, '珍珠/芋圆', 0, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `ingredient` VALUES (4, '奶盖', 5.00, 1000, '奶盖', 0, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `ingredient` VALUES (5, '芝士', 5.00, 1000, '奶盖', 0, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `ingredient` VALUES (6, '芋圆', 3.00, 1000, '珍珠/芋圆', 0, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `ingredient` VALUES (7, '红豆', 3.00, 1000, '配料', 0, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `ingredient` VALUES (8, '布丁', 3.00, 1000, '配料', 0, 1, '2025-04-23 17:01:26', '2025-05-04 15:15:28');

-- ----------------------------
-- Table structure for member_level
-- ----------------------------
DROP TABLE IF EXISTS `member_level`;
CREATE TABLE `member_level`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `amount_threshold` decimal(10, 2) NULL DEFAULT NULL,
  `birthday_privilege` bit(1) NULL DEFAULT NULL,
  `created_at` datetime(6) NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `discount` decimal(5, 2) NULL DEFAULT NULL,
  `free_shipping` bit(1) NULL DEFAULT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `level` int(0) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `point_rate` decimal(5, 2) NULL DEFAULT NULL,
  `point_threshold` int(0) NOT NULL,
  `priority_production` bit(1) NULL DEFAULT NULL,
  `status` int(0) NOT NULL,
  `updated_at` datetime(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UKpia61i00rojn4yjjufsw82he5`(`level`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of member_level
-- ----------------------------
INSERT INTO `member_level` VALUES (1, 0.00, b'0', NULL, '基础会员权益', 1.00, b'0', '', 0, '普通会员', 1.00, 0, b'0', 1, '2025-05-04 16:27:14.733411');
INSERT INTO `member_level` VALUES (2, 500.00, b'1', NULL, '银卡会员专享9.5折优惠', 0.95, b'0', NULL, 1, '银卡会员', 1.20, 1000, b'0', 1, '2025-05-04 16:22:36.708142');
INSERT INTO `member_level` VALUES (3, 1500.00, b'1', NULL, '金卡会员专享9折优惠', 0.90, b'1', NULL, 2, '金卡会员', 1.50, 3000, b'0', 1, NULL);
INSERT INTO `member_level` VALUES (4, 5000.00, b'1', NULL, '黑卡会员专享8.5折', 0.85, b'1', NULL, 3, '黑卡会员', 2.00, 8000, b'1', 1, NULL);

-- ----------------------------
-- Table structure for order
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '订单总金额',
  `discount_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '优惠金额',
  `payment_amount` decimal(10, 2) NOT NULL COMMENT '实付金额',
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `payment_time` datetime(0) NULL DEFAULT NULL COMMENT '支付时间',
  `status` int(0) NOT NULL,
  `take_no` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `user_coupon_id` bigint(0) NULL DEFAULT NULL,
  `coupon_discount_amount` decimal(10, 2) NULL DEFAULT NULL,
  `member_discount_amount` decimal(10, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_order_no`(`order_no`) USING BTREE,
  INDEX `idx_user`(`user_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  CONSTRAINT `FKcpl0mjoeqhxvgeeeq5piwpd3i` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 112 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order
-- ----------------------------
INSERT INTO `order` VALUES (1, 'O202306150001', 1, 42.00, 5.00, 37.00, 'wechat', '2023-06-15 14:30:15', 1, 'A12', NULL, '2025-04-23 19:53:46', '2025-05-04 06:50:51', NULL, NULL, NULL);
INSERT INTO `order` VALUES (2, 'O202306180002', 2, 68.00, 8.00, 60.00, 'alipay', '2023-06-18 12:45:22', 1, 'A13', '少冰', '2025-04-23 19:53:46', '2025-05-04 06:50:51', NULL, NULL, NULL);
INSERT INTO `order` VALUES (4, 'O202306250004', 3, 22.00, 0.00, 22.00, 'alipay', '2023-06-25 11:10:05', 1, 'A15', '不要红豆', '2025-04-23 19:53:46', '2025-05-04 06:50:51', NULL, NULL, NULL);
INSERT INTO `order` VALUES (5, 'O202306280005', 2, 55.00, 10.00, 45.00, 'wechat', '2023-06-28 19:35:27', 1, 'A16', NULL, '2025-04-23 19:53:46', '2025-05-04 06:50:51', NULL, NULL, NULL);
INSERT INTO `order` VALUES (6, 'O202307010006', 1, 36.00, 0.00, 36.00, 'alipay', '2023-07-01 20:15:40', 1, 'A17', NULL, '2025-04-23 19:53:46', '2025-05-04 06:50:51', NULL, NULL, NULL);
INSERT INTO `order` VALUES (7, 'O202307050007', 4, 42.00, 5.00, 37.00, 'wechat', '2023-07-05 17:25:10', 1, '967', '多加珍珠', '2025-04-23 19:53:46', '2025-05-04 06:50:51', NULL, NULL, NULL);
INSERT INTO `order` VALUES (8, 'O202307080008', 2, 63.00, 0.00, 63.00, NULL, NULL, 1, NULL, NULL, '2025-04-23 19:53:46', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (9, 'OD202504232207596025', 3, 39.00, 0.00, 39.00, 'alipay', '2025-04-23 22:08:24', 1, '381', '少冰', '2025-04-23 22:08:00', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (10, 'OD202504232227405995', 3, 18.00, 0.00, 18.00, NULL, NULL, 1, NULL, '请不要放吸管', '2025-04-23 22:27:41', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (11, 'OD202504232227441077', 3, 39.00, 0.00, 39.00, 'alipay', '2025-04-23 22:28:08', 1, '327', '少冰', '2025-04-23 22:27:45', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (12, 'OD202504232228237694', 3, 0.00, 0.00, 0.00, NULL, NULL, 1, NULL, '请不要放吸管', '2025-04-23 22:28:24', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (13, 'OD202504241847202064', 2, 21.00, 0.00, 21.00, 'wechat', '2025-04-24 18:51:47', 1, '972', NULL, '2025-04-24 18:47:20', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (14, 'OD202504241852304959', 2, 23.00, 0.00, 23.00, NULL, NULL, 1, NULL, NULL, '2025-04-24 18:52:30', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (17, 'OD202504272317570177', 1, 73.00, 0.00, 73.00, NULL, NULL, 1, NULL, '', '2025-04-27 23:17:58', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (20, 'OD202504272327345980', 1, 38.00, 0.00, 38.00, 'wechat', '2025-04-27 23:34:37', 1, '403', '', '2025-04-27 23:27:34', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (21, 'OD202504272332483880', 1, 16.00, 0.00, 16.00, 'wechat', '2025-04-27 23:33:46', 1, '594', '', '2025-04-27 23:32:49', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (22, 'OD202504272335267430', 1, 16.00, 0.00, 16.00, 'wechat', '2025-04-28 20:11:03', 1, '150', '', '2025-04-27 23:35:26', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (23, 'OD202504281837042957', 1, 16.00, 0.00, 16.00, 'wechat', '2025-04-28 19:46:41', 1, '573', '', '2025-04-28 18:37:05', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (24, 'OD202504281839247330', 1, 16.00, 0.00, 16.00, 'wechat', '2025-04-28 19:44:13', 1, '713', '', '2025-04-28 18:39:24', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (25, 'OD202504281839479121', 1, 16.00, 0.00, 16.00, 'wechat', '2025-04-28 19:39:55', 1, '317', '', '2025-04-28 18:39:47', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (26, 'OD202504281841322329', 1, 32.00, 0.00, 32.00, 'wechat', '2025-04-28 19:37:37', 1, '211', '', '2025-04-28 18:41:32', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (27, 'OD202504281844263865', 1, 32.00, 0.00, 32.00, 'wechat', '2025-04-28 19:11:35', 1, '936', '', '2025-04-28 18:44:27', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (28, 'OD202504281858328401', 1, 32.00, 0.00, 32.00, 'wechat', '2025-04-28 18:59:12', 1, '788', '', '2025-04-28 18:58:32', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (30, 'OD202504281928065089', 1, 32.00, 0.00, 32.00, 'wechat', '2025-04-28 19:35:46', 1, '703', '', '2025-04-28 19:28:06', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (31, 'OD202504282005229610', 1, 32.00, 0.00, 32.00, 'wechat', '2025-04-28 20:05:34', 1, '330', '', '2025-04-28 20:05:22', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (32, 'OD202504282022147876', 5, 19.00, 0.00, 19.00, 'wechat', '2025-04-28 20:24:34', 1, '755', '666', '2025-04-28 20:22:14', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (33, 'OD202504282024434142', 5, 19.00, 0.00, 19.00, 'wechat', '2025-04-28 20:24:52', 1, '852', '', '2025-04-28 20:24:43', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (34, 'OD202504282033092616', 5, 19.00, 10.00, 9.00, 'wechat', '2025-04-28 20:33:54', 1, '649', '', '2025-04-28 20:33:10', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (35, 'OD202504282036163833', 5, 19.00, 10.00, 9.00, NULL, NULL, 1, NULL, '666', '2025-04-28 20:36:17', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (36, 'OD202504282038418543', 5, 24.00, 10.00, 14.00, NULL, NULL, 1, NULL, '66', '2025-04-28 20:38:42', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (37, 'OD202504282042447749', 5, 48.00, 10.00, 38.00, NULL, NULL, 1, NULL, '', '2025-04-28 20:42:44', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (38, 'OD202504282043466425', 5, 36.00, 10.00, 26.00, 'wechat', '2025-04-28 20:55:09', 1, '687', '', '2025-04-28 20:43:47', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (39, 'OD202504282055427139', 5, 22.00, 10.00, 12.00, NULL, NULL, 1, NULL, '', '2025-04-28 20:55:42', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (40, 'OD202504282100050802', 5, 22.00, 0.00, 22.00, NULL, NULL, 1, NULL, '', '2025-04-28 21:00:05', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (41, 'OD202504282104534985', 5, 22.00, 10.00, 12.00, NULL, NULL, 1, NULL, '', '2025-04-28 21:04:54', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (42, 'OD202504282116383726', 5, 22.00, 0.00, 22.00, 'wechat', '2025-04-28 21:16:44', 1, '162', '', '2025-04-28 21:16:39', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (43, 'OD202504282117114325', 5, 22.00, 0.00, 22.00, NULL, NULL, 1, NULL, '', '2025-04-28 21:17:12', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (44, 'OD202504282118286879', 5, 20.00, 0.00, 20.00, NULL, NULL, 1, NULL, '', '2025-04-28 21:18:29', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (45, 'OD202504282122464590', 5, 20.00, 0.00, 20.00, NULL, NULL, 1, NULL, '', '2025-04-28 21:22:46', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (46, 'OD202504282202336336', 5, 17.00, 10.00, 7.00, 'wechat', '2025-04-28 22:02:39', 1, '266', '', '2025-04-28 22:02:33', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (47, 'OD202504282220480081', 5, 19.00, 10.00, 9.00, 'wechat', '2025-04-28 22:20:54', 1, '436', '', '2025-04-28 22:20:49', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (48, 'OD202504282230223186', 8, 19.00, 0.00, 19.00, 'wechat', '2025-04-28 22:30:39', 1, '415', '', '2025-04-28 22:30:22', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (49, 'OD202504282329569616', 1, 48.00, 10.00, 38.00, 'wechat', '2025-04-28 23:30:14', 1, '209', '', '2025-04-28 23:29:57', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (50, 'OD202504291344120620', 1, 16.00, 10.00, 6.00, 'wechat', '2025-04-29 13:44:21', 1, '547', '', '2025-04-29 13:44:12', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (51, 'OD202504291346400251', 1, 19.00, 10.00, 9.00, 'wechat', '2025-05-04 01:05:31', 1, '834', '', '2025-04-29 13:46:41', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (52, 'OD202504291409475194', 1, 19.00, 10.00, 9.00, 'wechat', '2025-04-29 14:09:52', 1, '274', '', '2025-04-29 14:09:47', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (53, 'OD202504291632217816', 1, 16.00, 10.00, 6.00, 'wechat', '2025-04-29 16:32:26', 1, '829', '', '2025-04-29 16:32:22', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (54, 'OD202504291636119940', 1, 19.00, 10.00, 9.00, 'wechat', '2025-04-29 16:36:16', 1, '363', '', '2025-04-29 16:36:12', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (55, 'OD202504291658397360', 1, 22.00, 10.00, 12.00, 'wechat', '2025-04-29 16:58:44', 1, '977', '', '2025-04-29 16:58:39', '2025-05-04 06:50:52', 8, NULL, NULL);
INSERT INTO `order` VALUES (56, 'OD202504291704197004', 1, 23.00, 0.00, 23.00, 'wechat', '2025-04-30 20:15:50', 1, '742', '', '2025-04-29 17:04:20', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (57, 'OD202504302015383079', 1, 115.00, 0.00, 115.00, 'wechat', '2025-04-30 20:15:43', 1, '397', '', '2025-04-30 20:15:39', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (59, 'OD202505011512353819', 12, 22.00, 0.00, 22.00, 'wechat', '2025-05-01 15:12:43', 1, '139', NULL, '2025-05-01 15:12:35', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (60, 'OD202505011520335908', 12, 24.00, 0.00, 24.00, 'wechat', '2025-05-01 15:20:41', 1, '562', NULL, '2025-05-01 15:20:33', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (61, 'OD202505011525229684', 12, 19.00, 0.00, 19.00, 'wechat', '2025-05-01 15:25:27', 1, '497', NULL, '2025-05-01 15:25:23', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (62, 'OD202505011529119772', 12, 22.00, 0.00, 22.00, 'wechat', '2025-05-01 15:29:16', 1, '442', NULL, '2025-05-01 15:29:12', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (63, 'OD202505011534480953', 12, 17.00, 0.00, 17.00, 'wechat', '2025-05-01 15:34:54', 1, '520', NULL, '2025-05-01 15:34:49', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (64, 'OD202505011538222231', 12, 18.00, 0.00, 18.00, 'wechat', '2025-05-01 15:38:36', 1, '233', NULL, '2025-05-01 15:38:22', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (65, 'OD202505011543039348', 12, 19.00, 0.00, 19.00, 'wechat', '2025-05-01 15:43:16', 1, '756', NULL, '2025-05-01 15:43:03', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (66, 'OD202505011543358970', 12, 17.00, 0.00, 17.00, 'wechat', '2025-05-01 15:43:55', 1, '498', NULL, '2025-05-01 15:43:35', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (67, 'OD202505011548189477', 12, 19.00, 0.00, 19.00, 'wechat', '2025-05-01 15:48:34', 1, '432', NULL, '2025-05-01 15:48:18', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (68, 'OD202505011553559174', 12, 19.00, 0.00, 19.00, 'alipay', '2025-05-01 15:54:11', 1, '849', NULL, '2025-05-01 15:53:55', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (70, 'OD202505011559591601', 12, 23.00, 0.00, 23.00, NULL, NULL, 1, NULL, NULL, '2025-05-01 15:59:59', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (73, 'OD202505012135144888', 1, 112.00, 0.00, 112.00, NULL, NULL, 1, NULL, '', '2025-05-01 21:35:15', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (74, 'OD202505012137570062', 1, 112.00, 0.00, 112.00, NULL, NULL, 1, NULL, '', '2025-05-01 21:37:57', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (75, 'OD202505012139125278', 1, 108.00, 0.00, 108.00, NULL, NULL, 1, NULL, '', '2025-05-01 21:39:13', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (76, 'OD202505012146555407', 1, 110.00, 0.00, 110.00, NULL, NULL, 1, NULL, '', '2025-05-01 21:46:55', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (81, 'OD202505012150339920', 1, 110.00, 0.00, 110.00, 'alipay', '2025-05-01 21:50:45', 1, '216', '', '2025-05-01 21:50:34', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (82, 'OD202505012155531719', 1, 22.00, 0.00, 22.00, 'alipay', '2025-05-01 22:26:45', 1, '001', '', '2025-05-01 21:55:53', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (83, 'OD202505021457263375', 1, 190.00, 30.00, 160.00, 'wechat', '2025-05-02 14:57:32', 1, '671', NULL, '2025-05-02 14:57:27', '2025-05-04 06:50:52', 12, NULL, NULL);
INSERT INTO `order` VALUES (84, 'OD202505021938245784', 1, 15.00, 0.00, 15.00, 'wechat', '2025-05-02 19:38:31', 1, '994', NULL, '2025-05-02 19:38:24', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (89, 'OD202505031917227723', 1, 22.00, 0.00, 22.00, NULL, NULL, 1, NULL, '', '2025-05-03 19:17:22', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (90, 'OD202505031920591748', 1, 19.00, 0.00, 19.00, NULL, NULL, 1, NULL, NULL, '2025-05-03 19:21:00', '2025-05-04 06:50:52', NULL, NULL, NULL);
INSERT INTO `order` VALUES (92, 'OD202505031927561777', 1, 17.00, 0.85, 16.15, 'wechat', '2025-05-03 19:28:15', 1, '128', NULL, '2025-05-03 19:27:57', '2025-05-04 06:50:52', NULL, 0.00, 0.85);
INSERT INTO `order` VALUES (94, 'OD202505031932574037', 1, 66.00, 17.55, 48.45, 'alipay', '2025-05-03 19:33:09', 6, '295', '支付方式: wechat | 会员9.5折 | 使用满减券减15元', '2025-05-03 19:32:57', '2025-05-18 19:20:40', 11, 15.00, 2.55);
INSERT INTO `order` VALUES (96, 'OD202505040630486773', 1, 17.00, 0.85, 16.15, 'wechat', '2025-05-04 06:30:56', 5, '382', '支付方式: wechat | 会员9.5折', '2025-05-04 06:30:49', '2025-05-04 09:01:55', NULL, 0.00, 0.85);
INSERT INTO `order` VALUES (104, 'OD202505041855460575', 4, 12.00, 0.60, 11.40, 'wechat', '2025-05-04 18:55:51', 1, '732', '支付方式: wechat | 会员9.5折', '2025-05-04 18:55:47', '2025-05-04 18:55:51', NULL, 0.00, 0.60);
INSERT INTO `order` VALUES (106, 'OD202505041904366013', 4, 22.00, 5.28, 16.72, 'wechat', '2025-05-04 19:04:51', 1, '470', '支付方式: wechat | 会员9.5折 | 使用8.0折优惠券', '2025-05-04 19:04:37', '2025-05-04 19:04:51', 43, 4.40, 0.88);
INSERT INTO `order` VALUES (108, 'OD202505161250382603', 1, 39.00, 3.90, 35.10, 'wechat', '2025-05-16 12:50:46', 3, '460', '66', '2025-05-16 12:50:38', '2025-05-24 16:23:24', NULL, 0.00, 3.90);
INSERT INTO `order` VALUES (109, 'OD202505181809503199', 1, 24.00, 6.90, 17.10, 'wechat', '2025-05-18 18:11:15', 3, '765', '', '2025-05-18 18:09:51', '2025-05-24 16:22:41', 45, 5.00, 1.90);
INSERT INTO `order` VALUES (111, 'OD202505241830583094', 1, 145.00, 14.50, 130.50, 'alipay', '2025-05-24 18:31:15', 1, '296', '', '2025-05-24 18:30:59', '2025-05-24 18:31:15', NULL, 0.00, 14.50);

-- ----------------------------
-- Table structure for order_detail
-- ----------------------------
DROP TABLE IF EXISTS `order_detail`;
CREATE TABLE `order_detail`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '订单详情ID',
  `order_id` bigint(0) NOT NULL COMMENT '订单ID',
  `product_id` bigint(0) NOT NULL COMMENT '商品ID',
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品图片',
  `price` decimal(10, 2) NOT NULL COMMENT '商品单价',
  `quantity` int(0) NOT NULL DEFAULT 1 COMMENT '数量',
  `temperature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `sweetness` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ingredients` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配料JSON格式，包含ID、名称和价格',
  `total_price` decimal(10, 2) NOT NULL COMMENT '总价',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order`(`order_id`) USING BTREE,
  CONSTRAINT `FKlb8mofup9mi791hraxt9wlj5u` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 133 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订单详情表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_detail
-- ----------------------------
INSERT INTO `order_detail` VALUES (1, 1, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '半糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00}]', 36.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (2, 1, 4, '满杯红柚', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '去冰', '微糖', '[]', 19.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (3, 2, 2, '芝士奶盖茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 18.00, 2, '常温', '全糖', '[{\"id\":4,\"name\":\"奶盖\",\"price\":5.00}]', 46.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (4, 2, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '多冰', '标准', '[]', 22.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (6, 4, 18, '抹茶红豆拿铁', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '热', '半糖', '[]', 22.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (7, 5, 9, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '全糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00}]', 19.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (8, 5, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '全糖', '[{\"id\":6,\"name\":\"芋圆\",\"price\":3.00},{\"id\":8,\"name\":\"布丁\",\"price\":3.00}]', 28.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (9, 6, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '热', '半糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00}]', 18.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (10, 6, 18, '抹茶红豆拿铁', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '热', '微糖', '[{\"id\":7,\"name\":\"红豆\",\"price\":3.00}]', 25.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (11, 7, 2, '芝士奶盖茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 18.00, 1, '常温', '半糖', '[{\"id\":4,\"name\":\"奶盖\",\"price\":5.00}]', 23.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (12, 7, 9, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '热', '全糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00}]', 19.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (13, 8, 17, '黑糖珍珠鲜奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 20.00, 3, '常温', '全糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00}]', 66.00, '2025-04-23 19:53:46');
INSERT INTO `order_detail` VALUES (14, 9, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '半糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00},{\"id\":3,\"name\":\"椰果\",\"price\":1.50}]', 39.00, '2025-04-23 22:08:00');
INSERT INTO `order_detail` VALUES (15, 10, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '半糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00}]', 18.00, '2025-04-23 22:27:41');
INSERT INTO `order_detail` VALUES (16, 11, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '半糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2.00},{\"id\":3,\"name\":\"椰果\",\"price\":1.50}]', 39.00, '2025-04-23 22:27:45');
INSERT INTO `order_detail` VALUES (17, 13, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '', '', '[{\"id\":4,\"name\":\"奶盖\",\"price\":5.00}]', 21.00, '2025-04-24 18:47:20');
INSERT INTO `order_detail` VALUES (18, 14, 2, '芝士奶盖茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 18.00, 1, '', '', '[{\"id\":4,\"name\":\"奶盖\",\"price\":5.00}]', 23.00, '2025-04-24 18:52:30');
INSERT INTO `order_detail` VALUES (21, 17, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-27 23:17:58');
INSERT INTO `order_detail` VALUES (22, 17, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 2, '常温', '标准糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2}]', 38.00, '2025-04-27 23:17:58');
INSERT INTO `order_detail` VALUES (23, 17, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '少糖', '[{\"id\":1,\"name\":\"珍珠\",\"price\":2}]', 19.00, '2025-04-27 23:17:58');
INSERT INTO `order_detail` VALUES (28, 20, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-27 23:27:34');
INSERT INTO `order_detail` VALUES (29, 20, 13, '拿铁咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-27 23:27:34');
INSERT INTO `order_detail` VALUES (30, 21, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-27 23:32:49');
INSERT INTO `order_detail` VALUES (31, 22, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-27 23:35:26');
INSERT INTO `order_detail` VALUES (32, 23, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-28 18:37:05');
INSERT INTO `order_detail` VALUES (33, 24, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-28 18:39:24');
INSERT INTO `order_detail` VALUES (34, 25, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-28 18:39:47');
INSERT INTO `order_detail` VALUES (35, 26, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '标准糖', NULL, 32.00, '2025-04-28 18:41:33');
INSERT INTO `order_detail` VALUES (36, 27, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '标准糖', NULL, 32.00, '2025-04-28 18:44:27');
INSERT INTO `order_detail` VALUES (37, 28, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '标准糖', NULL, 32.00, '2025-04-28 18:58:32');
INSERT INTO `order_detail` VALUES (39, 30, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '标准糖', NULL, 32.00, '2025-04-28 19:28:06');
INSERT INTO `order_detail` VALUES (40, 31, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 2, '常温', '标准糖', NULL, 32.00, '2025-04-28 20:05:22');
INSERT INTO `order_detail` VALUES (41, 32, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', '[{\"id\":7,\"name\":\"红豆\",\"price\":3}]', 19.00, '2025-04-28 20:22:14');
INSERT INTO `order_detail` VALUES (42, 33, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', '[{\"id\":7,\"name\":\"红豆\",\"price\":3}]', 19.00, '2025-04-28 20:24:43');
INSERT INTO `order_detail` VALUES (43, 34, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', '[{\"id\":7,\"name\":\"红豆\",\"price\":3}]', 19.00, '2025-04-28 20:33:10');
INSERT INTO `order_detail` VALUES (44, 35, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', '[{\"id\":7,\"name\":\"红豆\",\"price\":3}]', 19.00, '2025-04-28 20:36:17');
INSERT INTO `order_detail` VALUES (45, 36, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '半糖', '[{\"id\":2,\"name\":\"椰果\",\"price\":2}]', 24.00, '2025-04-28 20:38:42');
INSERT INTO `order_detail` VALUES (46, 37, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 2, '常温', '半糖', '[{\"id\":2,\"name\":\"椰果\",\"price\":2}]', 48.00, '2025-04-28 20:42:44');
INSERT INTO `order_detail` VALUES (47, 38, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-28 20:43:47');
INSERT INTO `order_detail` VALUES (48, 38, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '标准糖', NULL, 17.00, '2025-04-28 20:43:47');
INSERT INTO `order_detail` VALUES (49, 39, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', NULL, 22.00, '2025-04-28 20:55:42');
INSERT INTO `order_detail` VALUES (50, 40, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', NULL, 22.00, '2025-04-28 21:00:05');
INSERT INTO `order_detail` VALUES (51, 41, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', NULL, 22.00, '2025-04-28 21:04:54');
INSERT INTO `order_detail` VALUES (52, 42, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', NULL, 22.00, '2025-04-28 21:16:39');
INSERT INTO `order_detail` VALUES (53, 43, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', NULL, 22.00, '2025-04-28 21:17:12');
INSERT INTO `order_detail` VALUES (54, 44, 15, '摩卡咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 20.00, 1, '常温', '标准糖', NULL, 20.00, '2025-04-28 21:18:29');
INSERT INTO `order_detail` VALUES (55, 45, 15, '摩卡咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 20.00, 1, '常温', '标准糖', NULL, 20.00, '2025-04-28 21:22:46');
INSERT INTO `order_detail` VALUES (56, 46, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '标准糖', NULL, 17.00, '2025-04-28 22:02:33');
INSERT INTO `order_detail` VALUES (57, 47, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-28 22:20:49');
INSERT INTO `order_detail` VALUES (58, 48, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '半糖', '[{\"id\":6,\"name\":\"芋圆\",\"price\":3}]', 19.00, '2025-04-28 22:30:22');
INSERT INTO `order_detail` VALUES (59, 49, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 3, '常温', '标准糖', NULL, 48.00, '2025-04-28 23:29:57');
INSERT INTO `order_detail` VALUES (60, 50, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-29 13:44:12');
INSERT INTO `order_detail` VALUES (61, 51, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-29 13:46:41');
INSERT INTO `order_detail` VALUES (62, 52, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-29 14:09:47');
INSERT INTO `order_detail` VALUES (63, 53, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 1, '常温', '标准糖', NULL, 16.00, '2025-04-29 16:32:22');
INSERT INTO `order_detail` VALUES (64, 54, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-29 16:36:12');
INSERT INTO `order_detail` VALUES (65, 55, 19, '抹茶红豆拿铁', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '标准糖', NULL, 22.00, '2025-04-29 16:58:39');
INSERT INTO `order_detail` VALUES (66, 56, 17, '草莓雪顶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 23.00, 1, '冰', '标准糖', NULL, 23.00, '2025-04-29 17:04:20');
INSERT INTO `order_detail` VALUES (67, 57, 13, '拿铁咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-04-30 20:15:39');
INSERT INTO `order_detail` VALUES (68, 57, 18, '黑糖珍珠鲜奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 20.00, 1, '常温', '标准糖', '[{\"id\":5,\"name\":\"芝士\",\"price\":5}]', 25.00, '2025-04-30 20:15:39');
INSERT INTO `order_detail` VALUES (69, 57, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 2, '常温', '标准糖', '[{\"id\":7,\"name\":\"红豆\",\"price\":3}]', 50.00, '2025-04-30 20:15:39');
INSERT INTO `order_detail` VALUES (70, 57, 14, '焦糖玛奇朵', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 21.00, 1, '常温', '标准糖', NULL, 21.00, '2025-04-30 20:15:39');
INSERT INTO `order_detail` VALUES (72, 59, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '标准糖', NULL, 22.00, '2025-05-01 15:12:35');
INSERT INTO `order_detail` VALUES (73, 60, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', '[{\"id\":2,\"name\":\"椰果\",\"price\":2}]', 24.00, '2025-05-01 15:20:33');
INSERT INTO `order_detail` VALUES (74, 61, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-05-01 15:25:23');
INSERT INTO `order_detail` VALUES (75, 62, 19, '抹茶红豆拿铁', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', NULL, 22.00, '2025-05-01 15:29:12');
INSERT INTO `order_detail` VALUES (76, 63, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '标准糖', NULL, 17.00, '2025-05-01 15:34:49');
INSERT INTO `order_detail` VALUES (77, 64, 2, '芝士奶盖茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 18.00, 1, '常温', '标准糖', NULL, 18.00, '2025-05-01 15:38:22');
INSERT INTO `order_detail` VALUES (78, 65, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-05-01 15:43:03');
INSERT INTO `order_detail` VALUES (79, 66, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '标准糖', NULL, 17.00, '2025-05-01 15:43:35');
INSERT INTO `order_detail` VALUES (80, 67, 11, '椰香奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-05-01 15:48:18');
INSERT INTO `order_detail` VALUES (81, 68, 13, '拿铁咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-05-01 15:53:55');
INSERT INTO `order_detail` VALUES (83, 70, 6, '莓莓果茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 23.00, 1, '常温', '标准糖', NULL, 23.00, '2025-05-01 15:59:59');
INSERT INTO `order_detail` VALUES (86, 73, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 7, '常温', '标准糖', NULL, 112.00, '2025-05-01 21:35:15');
INSERT INTO `order_detail` VALUES (87, 74, 1, '招牌奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 16.00, 7, '常温', '标准糖', NULL, 112.00, '2025-05-01 21:37:57');
INSERT INTO `order_detail` VALUES (88, 75, 2, '芝士奶盖茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 18.00, 6, '常温', '标准糖', NULL, 108.00, '2025-05-01 21:39:13');
INSERT INTO `order_detail` VALUES (89, 76, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 5, '常温', '标准糖', NULL, 110.00, '2025-05-01 21:46:55');
INSERT INTO `order_detail` VALUES (90, 81, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 5, '常温', '标准糖', NULL, 110.00, '2025-05-01 21:50:34');
INSERT INTO `order_detail` VALUES (91, 82, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '标准糖', NULL, 22.00, '2025-05-01 21:55:53');
INSERT INTO `order_detail` VALUES (92, 83, 1, '三拼奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 15.00, 10, '常温', '标准糖', '[{\"id\":2,\"name\":\"椰果\",\"price\":2},{\"id\":1,\"name\":\"珍珠\",\"price\":2}]', 190.00, '2025-05-02 14:57:27');
INSERT INTO `order_detail` VALUES (93, 84, 1, '三拼奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 15.00, 1, '常温', '标准糖', NULL, 15.00, '2025-05-02 19:38:24');
INSERT INTO `order_detail` VALUES (98, 89, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '标准糖', NULL, 22.00, '2025-05-03 19:17:22');
INSERT INTO `order_detail` VALUES (99, 90, 13, '拿铁咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-05-03 19:21:00');
INSERT INTO `order_detail` VALUES (101, 92, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '标准糖', NULL, 17.00, '2025-05-03 19:27:57');
INSERT INTO `order_detail` VALUES (103, 94, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 3, '常温', '标准糖', NULL, 66.00, '2025-05-03 19:32:57');
INSERT INTO `order_detail` VALUES (105, 96, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '标准糖', NULL, 17.00, '2025-05-04 06:30:49');
INSERT INTO `order_detail` VALUES (113, 104, 20, '茉莉奶绿', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 12.00, 1, '常温', '标准糖', NULL, 12.00, '2025-05-04 18:55:47');
INSERT INTO `order_detail` VALUES (115, 106, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '标准糖', NULL, 22.00, '2025-05-04 19:04:37');
INSERT INTO `order_detail` VALUES (117, 108, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '少冰', '少糖', '[{\"id\":2,\"name\":\"椰果\",\"price\":2}]', 24.00, '2025-05-16 12:50:38');
INSERT INTO `order_detail` VALUES (118, 108, 1, '三拼奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 15.00, 1, '常温', '标准糖', NULL, 15.00, '2025-05-16 12:50:38');
INSERT INTO `order_detail` VALUES (119, 109, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '冰', '标准糖', '[{\"id\":2,\"name\":\"椰果\",\"price\":2}]', 24.00, '2025-05-18 18:09:51');
INSERT INTO `order_detail` VALUES (125, 111, 1, '三拼奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 15.00, 1, '常温', '标准糖', NULL, 15.00, '2025-05-24 18:30:59');
INSERT INTO `order_detail` VALUES (126, 111, 5, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '标准糖', NULL, 22.00, '2025-05-24 18:30:59');
INSERT INTO `order_detail` VALUES (127, 111, 20, '茉莉奶绿', 'http://localhost:8081/api/uploads/products/20250516/fd95a6129c9949809c92eda1dc03add8.png', 12.00, 1, '常温', '标准糖', NULL, 12.00, '2025-05-24 18:30:59');
INSERT INTO `order_detail` VALUES (128, 111, 16, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 22.00, 1, '常温', '标准糖', NULL, 22.00, '2025-05-24 18:30:59');
INSERT INTO `order_detail` VALUES (129, 111, 18, '黑糖珍珠鲜奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 20.00, 1, '常温', '标准糖', NULL, 20.00, '2025-05-24 18:30:59');
INSERT INTO `order_detail` VALUES (130, 111, 2, '芝士奶盖茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 18.00, 1, '常温', '标准糖', NULL, 18.00, '2025-05-24 18:30:59');
INSERT INTO `order_detail` VALUES (131, 111, 8, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 17.00, 1, '常温', '标准糖', NULL, 17.00, '2025-05-24 18:30:59');
INSERT INTO `order_detail` VALUES (132, 111, 3, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', 19.00, 1, '常温', '标准糖', NULL, 19.00, '2025-05-24 18:30:59');

-- ----------------------------
-- Table structure for order_refund
-- ----------------------------
DROP TABLE IF EXISTS `order_refund`;
CREATE TABLE `order_refund`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '退款ID',
  `order_id` bigint(0) NOT NULL COMMENT '订单ID',
  `refund_amount` decimal(10, 2) NOT NULL COMMENT '退款金额',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '退款原因',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `status` int(0) NOT NULL,
  `comment` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '处理说明',
  `process_time` datetime(0) NULL DEFAULT NULL COMMENT '处理时间',
  `processor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `refund_method` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `amount` decimal(10, 2) NOT NULL,
  `operator_id` bigint(0) NULL DEFAULT NULL,
  `operator_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`, `refund_amount`) USING BTREE,
  INDEX `idx_order_id`(`order_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE,
  CONSTRAINT `fk_refund_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '订单退款表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_refund
-- ----------------------------
INSERT INTO `order_refund` VALUES (4, 94, 48.45, '商品质量问题', '', 2, '6', '2025-05-05 23:10:16', 'admin', 1, '2025-05-05 23:09:54', '2025-05-05 23:09:54', 0.00, NULL, NULL);
INSERT INTO `order_refund` VALUES (5, 109, 17.10, '商品质量问题', '6', 0, NULL, NULL, NULL, 2, '2025-05-24 16:22:41', '2025-05-24 16:22:41', 17.10, NULL, NULL);
INSERT INTO `order_refund` VALUES (6, 108, 35.10, '商品质量问题', '', 0, NULL, NULL, NULL, 1, '2025-05-24 16:23:24', '2025-05-24 16:23:24', 35.10, NULL, NULL);

-- ----------------------------
-- Table structure for point_record
-- ----------------------------
DROP TABLE IF EXISTS `point_record`;
CREATE TABLE `point_record`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '积分记录ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `point` int(0) NOT NULL COMMENT '积分变动值，正数为增加，负数为减少',
  `type` int(0) NOT NULL,
  `order_id` bigint(0) NULL DEFAULT NULL COMMENT '关联订单ID',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '描述',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id`) USING BTREE,
  CONSTRAINT `FK7rvi863aac5350u3ggpdfbs58` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 76 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '积分记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of point_record
-- ----------------------------
INSERT INTO `point_record` VALUES (1, 1, 20, 1, 1, '购买奶茶获得积分', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (2, 1, 10, 1, 3, '购买奶茶获得积分', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (3, 1, 18, 1, 6, '购买奶茶获得积分', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (4, 1, -20, 2, 6, '使用积分抵扣', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (5, 2, 30, 1, 2, '购买奶茶获得积分', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (6, 2, 23, 1, 5, '购买奶茶获得积分', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (7, 3, 11, 1, 4, '购买奶茶获得积分', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (8, 4, 19, 1, 7, '购买奶茶获得积分', '2025-04-23 19:53:46');
INSERT INTO `point_record` VALUES (9, 2, 21, 1, 13, '订单消费：OD202504241847202064', '2025-04-24 18:51:47');
INSERT INTO `point_record` VALUES (10, 1, 16, 1, 21, '订单消费：OD202504272332483880', '2025-04-27 23:33:46');
INSERT INTO `point_record` VALUES (11, 1, 38, 1, 20, '订单消费：OD202504272327345980', '2025-04-27 23:34:37');
INSERT INTO `point_record` VALUES (12, 1, 32, 1, 28, '订单消费：OD202504281858328401', '2025-04-28 18:59:12');
INSERT INTO `point_record` VALUES (13, 1, 32, 1, 27, '订单消费：OD202504281844263865', '2025-04-28 19:11:35');
INSERT INTO `point_record` VALUES (14, 1, 32, 1, 30, '订单消费：OD202504281928065089', '2025-04-28 19:35:46');
INSERT INTO `point_record` VALUES (15, 1, 32, 1, 26, '订单消费：OD202504281841322329', '2025-04-28 19:37:37');
INSERT INTO `point_record` VALUES (16, 1, 16, 1, 25, '订单消费：OD202504281839479121', '2025-04-28 19:39:55');
INSERT INTO `point_record` VALUES (17, 1, 16, 1, 24, '订单消费：OD202504281839247330', '2025-04-28 19:44:13');
INSERT INTO `point_record` VALUES (18, 1, 16, 1, 23, '订单消费：OD202504281837042957', '2025-04-28 19:46:41');
INSERT INTO `point_record` VALUES (19, 1, 32, 1, 31, '订单消费：OD202504282005229610', '2025-04-28 20:05:34');
INSERT INTO `point_record` VALUES (20, 1, 16, 1, 22, '订单消费：OD202504272335267430', '2025-04-28 20:11:03');
INSERT INTO `point_record` VALUES (21, 5, 19, 1, 32, '订单消费：OD202504282022147876', '2025-04-28 20:24:34');
INSERT INTO `point_record` VALUES (22, 5, 19, 1, 33, '订单消费：OD202504282024434142', '2025-04-28 20:24:52');
INSERT INTO `point_record` VALUES (23, 5, 9, 1, 34, '订单消费：OD202504282033092616', '2025-04-28 20:33:54');
INSERT INTO `point_record` VALUES (24, 5, 26, 1, 38, '订单消费：OD202504282043466425', '2025-04-28 20:55:09');
INSERT INTO `point_record` VALUES (25, 5, 22, 1, 42, '订单消费：OD202504282116383726', '2025-04-28 21:16:44');
INSERT INTO `point_record` VALUES (26, 5, 7, 1, 46, '订单消费：OD202504282202336336', '2025-04-28 22:02:39');
INSERT INTO `point_record` VALUES (27, 5, 9, 1, 47, '订单消费：OD202504282220480081', '2025-04-28 22:20:54');
INSERT INTO `point_record` VALUES (28, 8, 19, 1, 48, '订单消费：OD202504282230223186', '2025-04-28 22:30:39');
INSERT INTO `point_record` VALUES (29, 1, 38, 1, 49, '订单消费：OD202504282329569616', '2025-04-28 23:30:14');
INSERT INTO `point_record` VALUES (30, 1, 6, 1, 50, '订单消费：OD202504291344120620', '2025-04-29 13:44:21');
INSERT INTO `point_record` VALUES (31, 1, 9, 1, 52, '订单消费：OD202504291409475194', '2025-04-29 14:09:52');
INSERT INTO `point_record` VALUES (32, 1, 6, 1, 53, '订单消费：OD202504291632217816', '2025-04-29 16:32:26');
INSERT INTO `point_record` VALUES (33, 1, 9, 1, 54, '订单消费：OD202504291636119940', '2025-04-29 16:43:52');
INSERT INTO `point_record` VALUES (34, 1, 12, 1, 55, '订单消费：OD202504291658397360', '2025-04-29 16:58:44');
INSERT INTO `point_record` VALUES (35, 1, 115, 1, 57, '订单消费：OD202504302015383079', '2025-04-30 20:15:43');
INSERT INTO `point_record` VALUES (36, 1, 23, 1, 56, '订单消费：OD202504291704197004', '2025-04-30 20:15:50');
INSERT INTO `point_record` VALUES (37, 12, 22, 1, 59, '订单消费：OD202505011512353819', '2025-05-01 15:12:43');
INSERT INTO `point_record` VALUES (38, 12, 24, 1, 60, '订单消费：OD202505011520335908', '2025-05-01 15:20:41');
INSERT INTO `point_record` VALUES (39, 12, 19, 1, 61, '订单消费：OD202505011525229684', '2025-05-01 15:25:27');
INSERT INTO `point_record` VALUES (40, 12, 22, 1, 62, '订单消费：OD202505011529119772', '2025-05-01 15:29:16');
INSERT INTO `point_record` VALUES (41, 12, 17, 1, 63, '订单消费：OD202505011534480953', '2025-05-01 15:34:54');
INSERT INTO `point_record` VALUES (42, 12, 18, 1, 64, '订单消费：OD202505011538222231', '2025-05-01 15:38:36');
INSERT INTO `point_record` VALUES (43, 12, 19, 1, 65, '订单消费：OD202505011543039348', '2025-05-01 15:43:16');
INSERT INTO `point_record` VALUES (44, 12, 17, 1, 66, '订单消费：OD202505011543358970', '2025-05-01 15:43:55');
INSERT INTO `point_record` VALUES (45, 12, 19, 1, 67, '订单消费：OD202505011548189477', '2025-05-01 15:53:37');
INSERT INTO `point_record` VALUES (47, 12, 19, 1, 68, '订单消费：OD202505011553559174', '2025-05-01 15:54:11');
INSERT INTO `point_record` VALUES (48, 1, 110, 1, 81, '订单消费：OD202505012150339920', '2025-05-01 21:50:45');
INSERT INTO `point_record` VALUES (49, 1, 22, 1, 82, '订单消费：OD202505012155531719', '2025-05-01 22:26:45');
INSERT INTO `point_record` VALUES (50, 1, 160, 1, 83, '订单消费：OD202505021457263375', '2025-05-02 14:57:32');
INSERT INTO `point_record` VALUES (51, 1, 100, 5, NULL, '管理员手动调整', '2025-05-02 16:36:10');
INSERT INTO `point_record` VALUES (52, 1, 100, 5, NULL, '管理员手动调整', '2025-05-02 16:48:17');
INSERT INTO `point_record` VALUES (53, 1, 2, 4, NULL, '每日签到奖励', '2025-05-02 18:31:44');
INSERT INTO `point_record` VALUES (54, 1, 15, 1, 84, '订单消费：OD202505021938245784', '2025-05-02 19:38:31');
INSERT INTO `point_record` VALUES (55, 1, 2, 4, NULL, '每日签到奖励', '2025-05-03 00:06:36');
INSERT INTO `point_record` VALUES (56, 1, 16, 1, 92, '订单消费：OD202505031927561777', '2025-05-03 19:28:15');
INSERT INTO `point_record` VALUES (57, 1, 48, 1, 94, '订单消费：OD202505031932574037', '2025-05-03 19:33:09');
INSERT INTO `point_record` VALUES (58, 1, 16, 1, 95, '订单消费：OD202505032215149909', '2025-05-03 22:15:18');
INSERT INTO `point_record` VALUES (59, 1, 16, 1, 96, '订单消费：OD202505040630486773', '2025-05-04 06:30:56');
INSERT INTO `point_record` VALUES (60, 13, 10, 5, NULL, '1', '2025-05-04 08:39:59');
INSERT INTO `point_record` VALUES (61, 1, 20, 1, 98, '订单消费：OD202505041234182063', '2025-05-04 12:34:23');
INSERT INTO `point_record` VALUES (62, 1, 5000, 5, NULL, '测试', '2025-05-04 14:36:01');
INSERT INTO `point_record` VALUES (63, 2, 8000, 5, NULL, '测试', '2025-05-04 14:36:55');
INSERT INTO `point_record` VALUES (64, 1, 2, 4, NULL, '每日签到奖励', '2025-05-04 16:25:06');
INSERT INTO `point_record` VALUES (65, 4, 2, 4, NULL, '每日签到奖励', '2025-05-04 18:32:01');
INSERT INTO `point_record` VALUES (66, 4, 11, 1, 104, '订单消费：OD202505041855460575', '2025-05-04 18:55:51');
INSERT INTO `point_record` VALUES (67, 4, 16, 1, 106, '订单消费：OD202505041904366013', '2025-05-04 19:04:51');
INSERT INTO `point_record` VALUES (68, 1, 19, 1, 107, '订单消费：OD202505051556286485', '2025-05-05 15:56:35');
INSERT INTO `point_record` VALUES (69, 1, 2, 4, NULL, '每日签到奖励', '2025-05-05 16:04:03');
INSERT INTO `point_record` VALUES (70, 1, 10, 1, 108, '订单消费：OD202505051901464710', '2025-05-05 19:01:52');
INSERT INTO `point_record` VALUES (71, 1, 2, 4, NULL, '每日签到奖励', '2025-05-16 12:39:27');
INSERT INTO `point_record` VALUES (72, 1, 35, 1, 108, '订单消费：OD202505161250382603', '2025-05-16 12:50:46');
INSERT INTO `point_record` VALUES (73, 1, 2, 4, NULL, '每日签到奖励', '2025-05-18 18:08:33');
INSERT INTO `point_record` VALUES (74, 1, 17, 1, 109, '订单消费：OD202505181809503199', '2025-05-18 18:11:15');
INSERT INTO `point_record` VALUES (75, 1, 130, 1, 111, '订单消费：OD202505241830583094', '2025-05-24 18:31:15');

-- ----------------------------
-- Table structure for point_rule
-- ----------------------------
DROP TABLE IF EXISTS `point_rule`;
CREATE TABLE `point_rule`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` int(0) NOT NULL,
  `formula` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_ratio` tinyint(1) NULL DEFAULT NULL,
  `point_value` decimal(10, 2) NULL DEFAULT NULL,
  `min_amount` decimal(10, 2) NULL DEFAULT NULL,
  `max_points` int(0) NULL DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` int(0) NOT NULL,
  `created_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of point_rule
-- ----------------------------
INSERT INTO `point_rule` VALUES (1, '消费积分', 1, '消费金额  积分比例', 1, 1.00, 10.00, 500, '会员消费获取积分，每消费1元获得1积分', 1, '2025-05-02 17:52:49', '2025-05-04 16:39:47');
INSERT INTO `point_rule` VALUES (2, '首次注册', 2, '固定积分', 0, 100.00, NULL, NULL, '新会员注册奖励100积分', 1, '2025-05-02 17:52:49', '2025-05-05 16:07:42');
INSERT INTO `point_rule` VALUES (3, '每日签到', 4, '固定积分', 0, 2.00, NULL, NULL, '会员每日签到获得2积分', 1, '2025-05-02 17:52:49', '2025-05-05 16:07:40');
INSERT INTO `point_rule` VALUES (4, '管理员调整', 5, '固定积分', NULL, NULL, NULL, NULL, '管理员调整', 1, '2025-05-18 19:00:08', '2025-05-18 19:00:12');

-- ----------------------------
-- Table structure for product
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `category_id` bigint(0) NOT NULL COMMENT '分类ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品图片',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '商品描述',
  `price` decimal(10, 2) NOT NULL COMMENT '商品价格',
  `stock` int(0) NULL DEFAULT NULL COMMENT '库存数量，NULL表示不限量',
  `sales` int(0) NULL DEFAULT 0 COMMENT '销量',
  `is_recommend` int(0) NULL DEFAULT NULL,
  `support_custom` int(0) NULL DEFAULT NULL,
  `sort` int(0) NULL DEFAULT 0 COMMENT '排序权重',
  `status` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category_id`) USING BTREE,
  CONSTRAINT `FK1mtsbur82frn64de7balymq9s` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product
-- ----------------------------
INSERT INTO `product` VALUES (1, 1, '三拼奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '经典口味，香浓奶茶配上嚼劲十足的珍珠，大杯更满足', 15.00, NULL, 877, 1, 1, 100, 1, '2025-04-23 17:01:26', '2025-05-24 18:31:15');
INSERT INTO `product` VALUES (2, 1, '芝士奶盖茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '现打醇香芝士奶盖，搭配优质茶底', 18.00, NULL, 164, 1, 1, 2, 1, '2025-04-23 17:01:26', '2025-05-24 18:31:15');
INSERT INTO `product` VALUES (3, 1, '脏脏茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '黑糖与奶盖的完美结合，层次丰富', 19.00, NULL, 76, 1, 1, 3, 1, '2025-04-23 17:01:26', '2025-05-24 18:31:15');
INSERT INTO `product` VALUES (4, 2, '满杯红柚', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '精选红柚果肉，清爽不腻口', 19.00, NULL, 325, 0, 1, 1, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (5, 2, '杨枝甘露', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '芒果、西柚与椰奶的热带风情', 22.00, NULL, 592, 1, 1, 2, 1, '2025-04-23 17:01:26', '2025-05-24 18:31:15');
INSERT INTO `product` VALUES (6, 2, '莓莓果茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '多种莓果搭配，酸甜可口', 23.00, NULL, 41, 0, 1, 3, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (7, 2, '柠檬青茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '新鲜柠檬片泡制，清香怡人', 18.00, NULL, 46, 0, 1, 4, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (8, 3, '波霸奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '经典波霸奶茶，珍珠Q弹有嚼劲', 17.00, NULL, 88, 1, 1, 1, 1, '2025-04-23 17:01:26', '2025-05-24 18:31:15');
INSERT INTO `product` VALUES (9, 3, '焦糖珍珠奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '焦糖香气与珍珠的美妙融合', 18.00, NULL, 94, 0, 1, 2, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (10, 3, '红豆奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '香甜红豆与醇香奶茶的经典搭配', 18.00, NULL, 241, 0, 1, 3, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (11, 3, '椰香奶茶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '浓郁椰香，口感丝滑', 19.00, NULL, 197, 0, 1, 4, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (12, 4, '美式咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '意式浓缩稀释，保留咖啡醇厚', 16.00, NULL, 56, 0, 1, 1, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (13, 4, '拿铁咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '香浓espresso与丝滑牛奶完美结合', 19.00, NULL, 67, 1, 1, 2, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (14, 4, '焦糖玛奇朵', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '焦糖风味与咖啡的层次感', 21.00, NULL, 45, 0, 1, 3, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (15, 4, '摩卡咖啡', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '巧克力与咖啡的美妙邂逅', 20.00, NULL, 35, 0, 1, 4, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (16, 5, '芋泥波波奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '香糯芋泥搭配Q弹波波，口感丰富', 22.00, NULL, 274, 1, 1, 1, 1, '2025-04-23 17:01:26', '2025-05-24 18:31:15');
INSERT INTO `product` VALUES (17, 5, '草莓雪顶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '清甜草莓与丝滑雪顶的梦幻组合', 23.00, NULL, 41, 0, 1, 2, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (18, 5, '黑糖珍珠鲜奶', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '现打鲜奶搭配黑糖珍珠，浓郁香甜', 20.00, NULL, 266, 1, 1, 3, 1, '2025-04-23 17:01:26', '2025-05-24 18:31:15');
INSERT INTO `product` VALUES (19, 5, '抹茶红豆拿铁', 'http://localhost:8081/api/uploads/products/20250514/3c96e0f9c1d6478290f2cd0bc8111256.png', '日式抹茶与红豆的和风风味', 22.00, NULL, 269, 0, 1, 4, 1, '2025-04-23 17:01:26', '2025-05-14 17:34:49');
INSERT INTO `product` VALUES (20, 1, '茉莉奶绿', 'http://localhost:8081/api/uploads/products/20250516/fd95a6129c9949809c92eda1dc03add8.png', '经典口味，香浓奶茶配上嚼劲十足的珍珠', 12.00, NULL, 350, 1, 1, 100, 1, '2025-05-01 23:11:16', '2025-05-24 18:31:15');

-- ----------------------------
-- Table structure for shop_info
-- ----------------------------
DROP TABLE IF EXISTS `shop_info`;
CREATE TABLE `shop_info`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `shop_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '店铺LOGO',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '店铺地址',
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `business_hours` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `notice` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '店铺公告',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `announcement` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `announcement_status` int(0) NULL DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '店铺信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shop_info
-- ----------------------------
INSERT INTO `shop_info` VALUES (1, '奶茶物语', 'https://milktea.bj.bcebos.com/products/20250506/0c66003334584a52a57d0e833c7108fc.jpg', '广东省中山市', '19582161715', '09:00-22:00', '欢迎光临奶茶物语，用心调制每一杯奶茶', '2025-04-23 17:01:26', '2025-05-06 20:18:32', NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for specification
-- ----------------------------
DROP TABLE IF EXISTS `specification`;
CREATE TABLE `specification`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '规格ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sort` int(0) NULL DEFAULT 0 COMMENT '排序权重',
  `status` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品规格表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of specification
-- ----------------------------
INSERT INTO `specification` VALUES (1, '常温', 'temperature', 1, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (2, '热', 'temperature', 2, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (3, '去冰', 'temperature', 3, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (4, '少冰', 'temperature', 4, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (5, '多冰', 'temperature', 5, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (6, '无糖', 'sweetness', 1, 1, '2025-04-23 17:01:26', '2025-05-04 16:00:34');
INSERT INTO `specification` VALUES (7, '微糖', 'sweetness', 2, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (8, '半糖', 'sweetness', 3, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (9, '少糖', 'sweetness', 4, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');
INSERT INTO `specification` VALUES (10, '全糖', 'sweetness', 5, 1, '2025-04-23 17:01:26', '2025-04-23 17:01:26');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像URL',
  `gender` int(0) NULL DEFAULT NULL,
  `birthday` date NULL DEFAULT NULL COMMENT '生日',
  `total_points` int(0) NULL DEFAULT 0 COMMENT '总积分',
  `member_level` int(0) NULL DEFAULT NULL,
  `status` int(0) NULL DEFAULT NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '11', '$2a$10$gQU9rQHdG9ThX/uNrr3KM.edYO6qmzrlMRTHGNjDB1t/cPCXnVqNS', '13800138123', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, '1990-01-01', 6342, 2, 1, '2025-04-23 17:47:16', '2025-05-24 18:31:15');
INSERT INTO `user` VALUES (2, 'testuser', '$2a$10$brY5foRIBu7RUJL7dzMEkuie1gIOc/CQ0RLYRWQ3zEPjUHG/q1JL6', '13800138000', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, '2000-01-01', 8074, 3, 1, '2025-04-23 17:52:17', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (3, 'testuser1', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', '13800138001', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, '1990-01-15', 500, 0, 1, '2025-04-23 19:53:46', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (4, 'testuser2', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', '13800138002', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 2, '1992-05-20', 1229, 1, 1, '2025-04-23 19:53:46', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (5, 'testuser3', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', '13800138003', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, '1988-11-10', 411, 0, 1, '2025-04-23 19:53:46', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (6, 'testuser4', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', '13800138004', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 2, '1995-07-22', 0, 0, 1, '2025-04-23 19:53:46', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (7, 'testuser6', '$2a$10$zrKvySubsBlbS78du81EZuw8YbxFicBQhP6nm8/QLyIL7G..w.v.6', '19582161715', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, '2010-12-31', 0, 0, 1, '2025-04-23 19:57:03', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (8, 'testuser18', '$2a$10$gAyI1m9h7rRGzJZDMvhXjOZ.XYn.0ILkcwYXB/u.g7KH19sMwZS/O', '13800138005', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, '2010-12-31', 19, 0, 1, '2025-04-23 22:48:50', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (9, 'testuser7', '$2a$10$FxtptF7eWSejFUSmIYRTrOBhGpovIkTZj0YiNTlZD2F77K2pT4zfS', '13800138007', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, NULL, 0, 0, 1, '2025-04-23 22:56:10', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (10, 'testuser8', '$2a$10$VB81hRs1Leaw2e89jxeRt.3zwD0G9QTjyfJRycOzKGK9M9GqdG326', '13800138010', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', 1, '1995-01-01', 0, 0, 1, '2025-04-23 23:12:47', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (11, 'testuser12', '$2a$10$que2p3qW/bo21WvcsEtz/OwjrYJNuzDIRR/GrFst2SKr2b4LjjPT6', '13812345679', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', NULL, NULL, 0, 0, 1, '2025-04-24 17:56:15', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (12, 'qqq', '$2a$10$Lkv/zcUCEX/u6Y/LZKFq..PsOC73hy7L1o0O/pdS0f7dPRAXCJ1g6', '13734676918', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', NULL, NULL, 196, 0, 1, '2025-04-30 20:29:01', '2025-05-23 16:07:08');
INSERT INTO `user` VALUES (13, 'cxy', '$2a$10$B1LVdMIfthElXJl3fBHzneM.Fxs7JRCXxiFZDG67BPY5ppESTzEFq', '19582161416', 'http://localhost:8081/api/uploads/avatars/20250523/e48e1fb2ecf0424bb528c7308200261f.png', NULL, NULL, 10, 0, 1, '2025-05-01 19:55:24', '2025-05-23 16:07:08');

-- ----------------------------
-- Table structure for user_coupon
-- ----------------------------
DROP TABLE IF EXISTS `user_coupon`;
CREATE TABLE `user_coupon`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` bigint(0) NOT NULL COMMENT '用户ID',
  `coupon_id` bigint(0) NOT NULL COMMENT '优惠券ID',
  `status` int(0) NOT NULL,
  `order_id` bigint(0) NULL DEFAULT NULL COMMENT '使用的订单ID',
  `used_time` datetime(0) NULL DEFAULT NULL COMMENT '使用时间',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '获取时间',
  `updated_at` datetime(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id`) USING BTREE,
  INDEX `idx_coupon`(`coupon_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  CONSTRAINT `FK23vpkw483hhbe77dgvimcipf4` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FKhu3g6gb02g6toj7gedrhos8bw` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户优惠券表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_coupon
-- ----------------------------
INSERT INTO `user_coupon` VALUES (1, 1, 1, 2, NULL, NULL, '2025-04-23 19:53:46', NULL);
INSERT INTO `user_coupon` VALUES (2, 1, 2, 2, NULL, NULL, '2025-04-23 19:53:46', NULL);
INSERT INTO `user_coupon` VALUES (3, 2, 3, 2, NULL, NULL, '2025-04-23 19:53:46', NULL);
INSERT INTO `user_coupon` VALUES (4, 2, 4, 2, NULL, NULL, '2025-04-23 19:53:46', NULL);
INSERT INTO `user_coupon` VALUES (5, 3, 2, 2, NULL, NULL, '2025-04-23 19:53:46', NULL);
INSERT INTO `user_coupon` VALUES (6, 4, 1, 2, NULL, NULL, '2025-04-23 19:53:46', NULL);
INSERT INTO `user_coupon` VALUES (7, 2, 6, 2, NULL, NULL, '2025-04-24 18:11:40', NULL);
INSERT INTO `user_coupon` VALUES (8, 1, 5, 2, 55, '2025-04-29 16:58:44', '2025-04-26 17:48:29', NULL);
INSERT INTO `user_coupon` VALUES (9, 7, 5, 2, NULL, NULL, '2025-04-26 22:38:21', NULL);
INSERT INTO `user_coupon` VALUES (10, 5, 5, 2, NULL, NULL, '2025-04-28 20:22:32', NULL);
INSERT INTO `user_coupon` VALUES (11, 1, 6, 2, 94, '2025-05-03 19:33:09', '2025-04-29 16:33:20', '2025-05-03 19:33:08.675779');
INSERT INTO `user_coupon` VALUES (12, 1, 7, 2, 83, '2025-05-02 14:57:32', '2025-04-30 19:47:36', NULL);
INSERT INTO `user_coupon` VALUES (13, 1, 9, 2, 99, '2025-05-04 18:01:10', '2025-05-02 17:17:38', '2025-05-04 18:01:10.471865');
INSERT INTO `user_coupon` VALUES (14, 1, 8, 2, NULL, NULL, '2025-05-03 19:33:31', '2025-05-06 20:26:08.265064');
INSERT INTO `user_coupon` VALUES (15, 13, 5, 2, NULL, NULL, '2025-05-04 11:26:47', '2025-05-04 11:26:46.822715');
INSERT INTO `user_coupon` VALUES (16, 12, 5, 2, NULL, NULL, '2025-05-04 11:26:57', '2025-05-04 11:26:57.420653');
INSERT INTO `user_coupon` VALUES (17, 11, 5, 2, NULL, NULL, '2025-05-04 11:26:57', '2025-05-04 11:26:57.422645');
INSERT INTO `user_coupon` VALUES (18, 10, 5, 2, NULL, NULL, '2025-05-04 11:26:57', '2025-05-04 11:26:57.422645');
INSERT INTO `user_coupon` VALUES (19, 9, 5, 2, NULL, NULL, '2025-05-04 11:26:57', '2025-05-04 11:26:57.423675');
INSERT INTO `user_coupon` VALUES (20, 8, 5, 2, NULL, NULL, '2025-05-04 11:26:57', '2025-05-04 11:26:57.424691');
INSERT INTO `user_coupon` VALUES (21, 3, 5, 2, NULL, NULL, '2025-05-04 11:26:57', '2025-05-04 11:26:57.425695');
INSERT INTO `user_coupon` VALUES (22, 4, 5, 2, NULL, NULL, '2025-05-04 11:26:57', '2025-05-04 11:26:57.427686');
INSERT INTO `user_coupon` VALUES (23, 13, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.265287');
INSERT INTO `user_coupon` VALUES (24, 12, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.266284');
INSERT INTO `user_coupon` VALUES (25, 11, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.267281');
INSERT INTO `user_coupon` VALUES (26, 10, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.267281');
INSERT INTO `user_coupon` VALUES (27, 9, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.268277');
INSERT INTO `user_coupon` VALUES (28, 8, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.268277');
INSERT INTO `user_coupon` VALUES (29, 7, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.268277');
INSERT INTO `user_coupon` VALUES (30, 3, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.269274');
INSERT INTO `user_coupon` VALUES (31, 4, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.270273');
INSERT INTO `user_coupon` VALUES (32, 5, 6, 2, NULL, NULL, '2025-05-04 11:29:37', '2025-05-04 11:29:37.271269');
INSERT INTO `user_coupon` VALUES (33, 6, 6, 2, NULL, NULL, '2025-05-04 11:31:39', '2025-05-04 11:31:39.321379');
INSERT INTO `user_coupon` VALUES (34, 2, 5, 2, NULL, NULL, '2025-05-04 11:39:53', '2025-05-04 11:39:52.774923');
INSERT INTO `user_coupon` VALUES (35, 13, 9, 2, NULL, NULL, '2025-05-04 11:49:17', '2025-05-04 11:49:16.597553');
INSERT INTO `user_coupon` VALUES (36, 12, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.789055');
INSERT INTO `user_coupon` VALUES (37, 11, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.791560');
INSERT INTO `user_coupon` VALUES (38, 10, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.792585');
INSERT INTO `user_coupon` VALUES (39, 9, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.794586');
INSERT INTO `user_coupon` VALUES (40, 8, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.795096');
INSERT INTO `user_coupon` VALUES (41, 7, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.796107');
INSERT INTO `user_coupon` VALUES (42, 3, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.798102');
INSERT INTO `user_coupon` VALUES (43, 4, 9, 2, 106, '2025-05-04 19:04:51', '2025-05-04 11:49:32', '2025-05-04 19:04:51.241576');
INSERT INTO `user_coupon` VALUES (44, 5, 9, 2, NULL, NULL, '2025-05-04 11:49:32', '2025-05-04 11:49:31.800091');
INSERT INTO `user_coupon` VALUES (45, 1, 10, 1, 109, '2025-05-18 18:11:15', '2025-05-18 18:09:06', '2025-05-18 18:11:14.979005');

SET FOREIGN_KEY_CHECKS = 1;
