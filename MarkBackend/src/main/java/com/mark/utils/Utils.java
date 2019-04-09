package com.mark.utils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.apache.spark.sql.Row;
//import org.json.simple.JSONObject;
import org.dmg.pmml.Array;

import scala.collection.JavaConverters;
import scala.collection.Seq;
import scala.util.parsing.json.JSONObject;

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
			JSONObject obj = new JSONObject(rows.get(0).getValuesMap(seq));
			l.add(obj.toString());
		}
		return l;
	}


	
}
