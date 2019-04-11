package com.mark.controller;

import java.io.FileWriter;
import java.io.IOException;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.mark.pojo.Response;
import com.mark.pojo.StringParser;
import com.mark.storage.Mongo;
import com.mark.utils.FileParser;
import com.mark.utils.FileUploader;
import com.mark.utils.QueryParser;
import com.mark.utils.Utils;

import scala.Tuple2;


@CrossOrigin(origins="http://localhost:3000")
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


	@RequestMapping("reset-frame")
	public ResponseEntity<JSONObject> resetFrame() {

		currentDf = masterDf;

		List<Row> x = masterDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = masterDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}

	@RequestMapping("get-frame")
	public ResponseEntity<JSONObject> currentFrame(@RequestParam("frame") String frame) {

		if (currentDf ==null) {
			currentDf = masterDf;
		}

		
		Dataset<Row> frameDf = null;
		
		switch (frame) {
		case "master":
			frameDf = masterDf;

			break;
		
		case "current":
			frameDf = currentDf;

			break;

		default:
			frameDf = masterDf;
			break;
		}


		List<Row> x = frameDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = frameDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping("create-master-df")
	public ResponseEntity<JSONObject> createMasterDataFrame(@RequestParam("docId") String docId) {

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
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = masterDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping("create-view")
	public ResponseEntity<Response> createView(@RequestParam("viewName") String viewName) {

		if (currentDf ==null) {
			currentDf = masterDf;
		}

		currentDf.createOrReplaceTempView(viewName);

		Response res = new Response(true, "View created", viewName);

		return new ResponseEntity<>(res, HttpStatus.OK);

	}



	@RequestMapping("select-df")
	public ResponseEntity<JSONObject> selectDataFrame(@RequestParam("columns") List<String> columns) {

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
		JSONObject js = Utils.convertFrameToJson2(x);


		Tuple2<String, String>[] dtypes = currentDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping(value = "filter-column", method = RequestMethod.POST )
	public ResponseEntity<JSONObject> filterColumn(@RequestBody StringParser parser) {


		if (currentDf ==null) {
			currentDf = masterDf;
		}

		currentDf = sparkSession.sql(parser.getRawQuery());
		List<Row> x = currentDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = currentDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping(value="visualizations")
	public ResponseEntity<JSONObject> visualizations(@RequestParam String column, @RequestParam String column_type){



		if (currentDf ==null) {
			currentDf = masterDf;
		}

		Dataset<Row> groupFrame = currentDf.groupBy(currentDf.col(column)).count();
		JSONObject js = Utils.convertFrameToJson2(groupFrame.collectAsList());

		Tuple2<String, String>[] dtypes = groupFrame.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);
		return new ResponseEntity<>(js, HttpStatus.OK);

	}


	@RequestMapping(value="visualizations-multiple")
	public ResponseEntity<JSONObject> visualizationsMultiple(@RequestParam("columns") List<String> columns){


		if (currentDf == null) {
			currentDf = masterDf;
		}

		Dataset<Row> groupFrame = currentDf.select(currentDf.col(columns.get(0)),currentDf.col(columns.get(1)));
		JSONObject js = Utils.convertFrameToJson2(groupFrame.collectAsList());

		Tuple2<String, String>[] dtypes = groupFrame.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);
		return new ResponseEntity<>(js, HttpStatus.OK);

	}
	
	@RequestMapping(value="statistics")
	public ResponseEntity<JSONObject> statistics(@RequestParam("columns") List<String> columns){
		
		if (currentDf == null) {
			currentDf = masterDf;
		}
		
		String[] cols = new String[columns.size()];
		cols = columns.toArray(cols);
		
		Dataset<Row> col1 = currentDf.describe().select(currentDf.col(columns.get(0)));
		
		if (columns.size()>1) {
			col1 = currentDf.describe().select(currentDf.col(columns.get(0)),currentDf.col(columns.get(1)));
		}
		
		JSONObject js = Utils.convertFrameToJson2(col1.collectAsList());
		
		Tuple2<String, String>[] dtypes = col1.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);
		return new ResponseEntity<>(js, HttpStatus.OK);
		
		
		
	}
	
	
	






}
