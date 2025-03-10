package net.geoprism.geoai.explorer.web.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = { "net.geoprism.geoai.explorer.core", "net.geoprism.geoai.explorer.web" })
public class Application extends SpringBootServletInitializer
{
  public static void main(String[] args)
  {
    SpringApplication.run(Application.class, args);
  }
}
