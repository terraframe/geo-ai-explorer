package net.geoprism.geoai.explorer.core.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:application.properties")
@ComponentScan("net.geoprism.geoai.explorer.core")
public class CoreConfiguration
{


}