package com.smartdoor.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartDoorOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartDoorLight REST API")
                        .description("Backend IoT monitoring and automatic lighting management service for ESP32 systems.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SmartDoorLight Engineering Team")
                                .email("iot-support@smartdoor.local"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}
