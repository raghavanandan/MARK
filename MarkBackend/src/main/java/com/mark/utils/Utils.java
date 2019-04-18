package com.mark.utils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.apache.spark.sql.Row;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import scala.Tuple2;
import scala.collection.JavaConverters;
import scala.collection.Seq;
import scala.collection.immutable.Map;

@SuppressWarnings("deprecation")
public class Utils {


	public static String getFileName() {
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

		return s;
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





}
