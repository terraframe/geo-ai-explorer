package net.geoprism.geoai.explorer.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@Profile("dev")
public class DevelopmentSecurityConfig
{

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception
  {
    http.csrf(csrf -> csrf.disable());
    return http.build();
  }
}