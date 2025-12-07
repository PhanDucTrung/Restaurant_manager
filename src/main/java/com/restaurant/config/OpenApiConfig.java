package com.restaurant.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hệ thống Quản lý Nhà hàng API")
                        .version("1.0.0")
                        .description("API Documentation cho hệ thống quản lý nhà hàng. " +
                                "Hệ thống hỗ trợ quản lý bàn, nhân viên, khách hàng, hóa đơn, menu, thanh toán và nhập kho.")
                        .contact(new Contact()
                                .name("Restaurant Management System")
                                .email("support@restaurant.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development Server"),
                        new Server()
                                .url("https://api.restaurant.com")
                                .description("Production Server")
                ));
    }
}













