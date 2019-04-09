package com.mark.controller;

import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;
import org.bson.Document;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.mark.pojo.Parser;
import com.mark.pojo.Response;
import com.mark.storage.Mongo;
import com.mark.utils.FileParser;
import com.mark.utils.FileUploader;
import com.mark.utils.QueryParser;
import com.mark.utils.Test;
import com.mark.utils.Utils;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;


@RequestMapping("api")
@Controller
public class ApiController {
	@Autowired
	WordCount wordCount;

	@Autowired
	FileParser fileParser;

	@Autowired
	private Mongo mongo;
	
	@Autowired
	QueryParser queryParser;
	
	@Autowired
	private SparkSession sparkSession;
	
	private static Dataset<Row> masterDf;
	
	private static Dataset<Row> currentDf;
	
	@RequestMapping("wordcount")
	public ResponseEntity<List<Count>> words() {
		return new ResponseEntity<>(wordCount.count(), HttpStatus.OK);
	}

	@RequestMapping(value = "upload-file", method = RequestMethod.POST, produces =MediaType.APPLICATION_JSON_VALUE )
	public ResponseEntity<Response> uploadFile(@RequestParam("file") MultipartFile file){

		String fpath = null;
		try {
			fpath = FileUploader.storeFile(file);
		} catch (IllegalStateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("filepath: "+fpath);

		return new ResponseEntity<>(fileParser.parseFile(fpath), HttpStatus.OK);
	}

	@RequestMapping("get-doc")
	public ResponseEntity<JSONObject> getDoc(@RequestParam("docId") String docId) {

		JSONObject result = mongo.getDoc(docId);

		return new ResponseEntity<>(result, HttpStatus.OK);
	}
	
	@RequestMapping("create-master-df")
	public ResponseEntity<String> createMasterDataFrame(@RequestParam("docId") String docId) {

		JSONObject result = mongo.getDoc(docId);
		JavaSparkContext sc = JavaSparkContext.fromSparkContext(sparkSession.sparkContext());
		JSONArray jsn = new JSONArray();

		List<Document> jsonArray = (List<Document>) result.get("docs");

		for (Document obj :jsonArray) {
			jsn.add(obj);
		}
		try (FileWriter file = new FileWriter("/tmp/file1.txt")) {
			file.write(jsn.toJSONString());
			System.out.println("Successfully Copied JSON Object to File...");

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		masterDf = sparkSession.read().json("/tmp/file1.txt");
		masterDf.show();
		
		List<Row> x = masterDf.collectAsList();
		List<String> js = Utils.convertFrameToJson(x);
		
		

		return new ResponseEntity<>(js.toString(), HttpStatus.OK);
	}
	
	
	@RequestMapping("select-df")
	public ResponseEntity<String> selectDataFrame(@RequestParam("columns") List<String> columns) {

		JavaSparkContext sc = JavaSparkContext.fromSparkContext(sparkSession.sparkContext());
		
		if (currentDf ==null) {
			currentDf = masterDf;
		}
		
		String[] p = columns.toArray(new String[0]);
		
		for (String s :p) {
			System.out.println(s);
		}
		
		currentDf.show();
		
		currentDf = currentDf.selectExpr(p);
		
		
		List<Row> x = currentDf.collectAsList();
		List<String> js = Utils.convertFrameToJson(x);
		
		
		return new ResponseEntity<>(js.toString(), HttpStatus.OK);
	}


	@PostMapping("/filter-column")
	public ResponseEntity<Response> filterColumn(@RequestBody Parser parser) {
		
		
		queryParser.parseQuery(parser);
		
		return new ResponseEntity<>(null, HttpStatus.OK);
	}





}
