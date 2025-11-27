package com.luv2code.ecommerce.config;

import org.springframework.security.config.Customizer;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.accept.ContentNegotiationStrategy;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        //protect endpoint / api/ orders
        http.authorizeHttpRequests(configurer ->
            configurer
                    .requestMatchers("/api/orders/**")
                    .authenticated()
                    .anyRequest().permitAll()
        );
        http.oauth2ResourceServer(oauth2 -> oauth2
            .jwt(Customizer.withDefaults())
        );     
        
        //add CORS filters
        http.cors(Customizer.withDefaults());

        //add content negotiation strategy
        http.setSharedObject(ContentNegotiationStrategy.class, new HeaderContentNegotiationStrategy()); 

        //force a non-empty response body for 401's to make the response more friendly
        http.exceptionHandling(configurer
            -> configurer.authenticationEntryPoint((request, response, authException) -> {

                response.addHeader("WWW-Authenticate", "Bearer");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            })
        );

        //disable CSRF since we are not using cookies for session tracking
        http.csrf(csrf -> csrf.disable());


        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList("https://localhost:4200"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
