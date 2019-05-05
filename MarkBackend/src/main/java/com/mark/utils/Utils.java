package com.mark.utils;

import java.io.File;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FileUtils;
import org.apache.spark.sql.Row;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import scala.Tuple2;
import scala.collection.JavaConverters;
import scala.collection.Seq;

@SuppressWarnings("deprecation")
public class Utils {


	public static String getRandomKey() {
		long now = Instant.now().toEpochMilli();
		return String.valueOf(now);
	}


	public static Object stringToDataType(String s)  {
		// detections ordered by probability of occurrence in Buffer_Bank.

		try {
			return Integer.parseInt(s);
		}
		catch(NumberFormatException e) {
			;
		}

		try {
			return Double.parseDouble(s);
		}
		catch(NumberFormatException e) {
			;
		}

		return s.trim();
	}

	public static List<String> convertFrameToJson(List<Row> rows) {
		Seq<String> seq = JavaConverters.asScalaIteratorConverter(Arrays.asList(rows.get(0).schema().fieldNames()).iterator()).asScala().toSeq();

		List<String> l = new ArrayList<>();

		for (Row r : rows) {

			scala.util.parsing.json.JSONObject obj = new scala.util.parsing.json.JSONObject(r.getValuesMap(seq));
			l.add(obj.toString());
		}

		return l;
	}

	public static JSONObject convertFrameToJson2(List<Row> rows) {
		
		System.out.println("row to convert");
		System.out.println(rows);

		String[] fields = rows.get(0).schema().fieldNames();
		//List<String> l = new ArrayList<>();

		JSONObject master = new JSONObject();

		JSONArray arr = new JSONArray();

		for (Row r : rows) {
			JSONObject obj = new JSONObject();
			for (int i=0; i<fields.length;i++) {
				obj.put(fields[i], r.get(i));
			}
			arr.add(obj);
		}

		master.put("docs", arr);

		return master;
	}

	public static JSONObject convertFrameToJson2Cols(List<Row> rows, String[] fields) {

		//List<String> l = new ArrayList<>();

		JSONObject master = new JSONObject();

		JSONArray arr = new JSONArray();

		for (Row r : rows) {
			JSONObject obj = new JSONObject();
			for (int i=0; i<fields.length;i++) {
				obj.put(fields[i], r.get(i));
			}
			arr.add(obj);
		}

		master.put("docs", arr);

		return master;
	}

	public static JSONObject convertFrameToJson2Single(List<Row> rows) {

		String[] fields = rows.get(0).schema().fieldNames();
		//List<String> l = new ArrayList<>();

		JSONObject master = new JSONObject();

		JSONArray arr = new JSONArray();

		for (Row r : rows) {

			arr.add(r.get(0));
		}

		master.put("docs", arr);

		return master;
	}




	public static JSONArray getTypes(Tuple2<String, String>[] dtypes) {

		JSONArray arr = new JSONArray();



		for (Tuple2<String, String> tup : dtypes) {
			JSONObject obj = new JSONObject();
			obj.put("header", tup._1);
			obj.put("type", tup._2);
			arr.add(obj);
		}

		return arr;

	}


	public static double[] getDouble(String val) {

		String[] values = val.split(",");

		double[] nums = new double[values.length];
		for (int i = 0; i < values.length; i++) {
			nums[i] = Double.parseDouble(values[i]);
		}
		return nums;
	}

	public static int[] getInt(String val) {

		String[] values = val.split(",");

		int[] nums = new int[values.length];
		for (int i = 0; i < values.length; i++) {
			nums[i] = Integer.parseInt(values[i]);
		}
		return nums;
	}


	public static JSONObject convertFrameToJsonSummary(List<Row> rows) {
		String[] fields = rows.get(0).schema().fieldNames();
		//List<String> l = new ArrayList<>();

		JSONObject master = new JSONObject();

		JSONArray arr = new JSONArray();

		for (Row r : rows) {
			JSONObject obj = new JSONObject();
			for (int i=0; i<fields.length;i++) {

				if (obj.get("summary")!=null && (obj.get("summary").equals("stddev") || obj.get("summary").equals("mean"))) {
					try {
						obj.put(fields[i], String.format("%.2f",Double.valueOf((String) r.get(i))));
					}
					catch(Exception e) {
						obj.put(fields[i], r.get(i));
					}
				}
				else {

					obj.put(fields[i], r.get(i));
				}
			}
			arr.add(obj);
		}

		master.put("docs", arr);

		return master;
	}
	
	
	public static String getFileSize(String path) {
		
		File f = new File(path);
		String readableSize = FileUtils.byteCountToDisplaySize(f.length());
		return readableSize;
		
		
		
		
	}


	public static JSONObject convertFrameToJson2ColsRoc(List<Row> rows, String[] fields) {
		JSONObject master = new JSONObject();

		JSONArray arr = new JSONArray();

		for (Row r : rows) {
			JSONObject obj = new JSONObject();
			for (int i=0; i<fields.length;i++) {
				if (fields[i].equals("TPR")) {
					obj.put("value", String.valueOf(r.get(i)));
				}
				else {
					obj.put("label", String.valueOf(r.get(i)));
				}
			}
			arr.add(obj);
		}

		master.put("docs", arr);

		return master;
	}
	
	public static String getColumnType(Tuple2<String, String>[] dtypes, String col) {
		
		for (Tuple2<String, String> tup : dtypes) {
			
			if (tup._1.equals(col)) {
				return tup._2;
			}
			
		}
		return "";
		
	}
	
	
	public static JSONObject parseBestParam(Map<String, String> sentParams, String bestParams) {
		
			
		bestParams = bestParams.toLowerCase();
		Iterator<String> keys = sentParams.keySet().iterator();
		
		JSONObject res = new JSONObject();

		while(keys.hasNext()) {
		    String key = keys.next();
		    
		    try {
		    
		    int s = bestParams.indexOf(key.toLowerCase()+":");
		    int l = bestParams.indexOf("\n", s);
		    
		    String t = bestParams.substring(s, l);
		    
		    String r = t.substring(t.lastIndexOf("current:")+8, t.lastIndexOf(")"));
		    
		    res.put(key, r.trim());
		    }
		    catch(Exception e) {
		    	e.printStackTrace();
		    	res.put(key, "");
		    }
		}
		return res;
		}
	
	
	public static void main(String[] args) {
		
		Map<String, String> obj = new HashMap<>();
		obj.put("maxBins", "");
		obj.put("maxDepth", "");
		obj.put("minInfoGain", "");
		obj.put("minInstancesperNode", "");
		
		String bestParams = "cacheNodeIds: If false, the algorithm will pass trees to executors to match instances with nodes. If true, the algorithm will cache node IDs for each instance. Caching can speed up training of deeper trees. (default: false)\ncheckpointInterval: set checkpoint interval (>= 1) or disable checkpoint (-1). E.g. 10 means that the cache will get checkpointed every 10 iterations (default: 10)\nfeaturesCol: features column name (default: features)\nimpurity: Criterion used for information gain calculation (case-insensitive). Supported options: entropy, gini (default: gini)\nlabelCol: label column name (default: label)\nmaxBins: Max number of bins for discretizing continuous features.  Must be >=2 and >= number of categories for any categorical feature. (default: 32, current: 32)\nmaxDepth: Maximum depth of the tree. (>= 0) E.g., depth 0 means 1 leaf node; depth 1 means 1 internal node + 2 leaf nodes. (default: 5, current: 1)\nmaxMemoryInMB: Maximum memory in MB allocated to histogram aggregation. (default: 256)\nminInfoGain: Minimum information gain for a split to be considered at a tree node. (default: 0.0, current: 0.0)\nminInstancesPerNode: Minimum number of instances each child must have after split.  If a split causes the left or right child to have fewer than minInstancesPerNode, the split will be discarded as invalid. Should be >= 1. (default: 1, current: 2)\npredictionCol: prediction column name (default: prediction)\nprobabilityCol: Column name for predicted class conditional probabilities. Note: Not all models output well-calibrated probability estimates! These probabilities should be treated as confidences, not precise probabilities (default: probability)\nrawPredictionCol: raw prediction (a.k.a. confidence) column name (default: rawPrediction)\nseed: random seed (default: 159147643)\nthresholds: Thresholds in multi-class classification to adjust the probability of predicting each class. Array must have length equal to the number of classes, with values > 0 excepting that at most one value may be 0. The class with largest value p/t is predicted, where p is the original probability of that class and t is the class's threshold (undefined)";
		
		System.out.println(parseBestParam(obj, bestParams));
		
	}

	}





	
