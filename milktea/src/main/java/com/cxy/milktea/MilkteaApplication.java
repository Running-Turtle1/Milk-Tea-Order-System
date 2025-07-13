package com.cxy.milktea;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 奶茶点单系统应用程序入口
 * 这是一个基于Spring Boot的Web应用，用于提供奶茶店线上点单服务
 */
@SpringBootApplication
public class MilkteaApplication {

	/**
	 * 应用程序主方法，启动Spring Boot应用
	 * @param args 命令行参数
	 */
	public static void main(String[] args) {
		SpringApplication.run(MilkteaApplication.class, args);
	}

}
