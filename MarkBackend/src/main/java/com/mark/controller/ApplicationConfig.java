package com.mark.controller;

import java.net.UnknownHostException;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.Environment;

import com.codahale.metrics.Slf4jReporter.LoggingLevel;
import com.mongodb.MongoClient;

/**
 * Created by achat1 on 9/22/15.
 */
@Configuration
@PropertySource("classpath:application.properties")
@ComponentScan({"com.mark.controller","com.mark.storage","com.mark.utils"})
public class ApplicationConfig {

    @Autowired
    private Environment env;

    @Value("${app.name:jigsaw}")
    private String appName;

    @Value("${spark.home}")
    private String sparkHome;

    @Value("${master.uri:local}")
    private String masterUri;
    
    @Value("${mongo.host}")
    private String mongoHost;
    
    @Value("${mongo.port}")
    private int mongoPort;
    
    private MongoClient mc;
    
    private JavaSparkContext jsc;
    
    

    @Bean
    public SparkConf sparkConf() {
        SparkConf sparkConf = new SparkConf()
                .setAppName(appName)
                .setMaster(masterUri);
        
        return sparkConf;
    }

    @Bean
    public JavaSparkContext javaSparkContext() {
    	jsc = new JavaSparkContext(sparkConf());
        return jsc;
    }

    @Bean
    public SparkSession sparkSession() {
        SparkSession spark = SparkSession
                .builder()
                .sparkContext(javaSparkContext().sc())
                .appName("Java Spark SQL basic example")
                .getOrCreate();
        spark.sparkContext().setLogLevel("ERROR");
        return spark;
    }

  

    
    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }
    
    @Bean
    public MongoClient mongoClient() throws UnknownHostException {
    	System.out.println("Setting mongo bean");
    	mc = new MongoClient(mongoHost, mongoPort);
    	System.out.println("Setting mongo bean done");
    	return mc;
    }

}