package com.mark.utils;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.bson.Document;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mark.pojo.Parser;
import com.mark.pojo.Response;
import com.mark.storage.Mongo;;


@Component
public class QueryParser {

	@Autowired
	private SparkSession sparkSession;

	@Autowired
	private Mongo mongo;
	
	private Dataset<Row> df;
	

	public Response parseQuery(Parser parser) {


		JSONObject document = mongo.getDoc(parser.getDocId());

		JavaSparkContext sc = JavaSparkContext.fromSparkContext(sparkSession.sparkContext());

		JSONArray jsn = new JSONArray();

		List<Document> jsonArray = (List<Document>) document.get("docs");

		for (Document obj :jsonArray) {
			System.out.println(obj.toJson());
			jsn.add(obj);
		}

		try (FileWriter file = new FileWriter("/tmp/file1.txt")) {
			file.write(jsn.toJSONString());
			System.out.println("Successfully Copied JSON Object to File...");

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		df = sparkSession.read().json("/tmp/file1.txt");
		df.show();


		return null;
	}






}
