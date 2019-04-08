package com.mark.utils;

import java.time.Instant;

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


	
}
