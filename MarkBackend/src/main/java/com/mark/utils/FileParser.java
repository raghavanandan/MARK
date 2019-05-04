package com.mark.utils;

import java.awt.List;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;

import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.mark.pojo.Response;
import com.mark.storage.Mongo;
import com.opencsv.CSVReader;

import scala.reflect.internal.Trees.New;


@Component
public class FileParser {

	@Autowired
	private Mongo mongo;

	public Response parseFile(String filePath, String name, String description, boolean headerPresent) {

		Reader reader = null;
		try {
			reader = Files.newBufferedReader(Paths.get(filePath));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();

			//return response
		}

		CSVReader csvReader = new CSVReader(reader);
		String[] header = null, nextRecord;
		String[] d = null;
		if (headerPresent) {
			try {
				header = csvReader.readNext();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();

				//illegal header
			}
		}
		else {
			try {
				d = csvReader.readNext();
				header = new String[d.length];
				for (int i=0; i< d.length; ++i) {
					header[i] = "feature_"+i;
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
		}
	


		ArrayList<HashMap<String, Object>> records = new ArrayList<HashMap<String, Object>>();


		HashMap<String, Object> meta = new HashMap<>();

		meta.put("header", header);
		meta.put("name", name);
		meta.put("size", Utils.getFileSize(filePath));
		meta.put("description", description);
		meta.put("timestamp", Calendar.getInstance().getTimeInMillis());

		String js = new Gson().toJson(meta);


		String objectId = mongo.insertOne(js);


		try {
			while((nextRecord = csvReader.readNext()) != null) {
				HashMap<String, Object> record = new HashMap<String, Object>();
				for (int i=0; i< header.length; ++i) {
					record.put(header[i], Utils.stringToDataType(nextRecord[i]));
				}
				record.put("meta_id",objectId);
				records.add(record);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			//illegal body
		}
		
		if (!headerPresent) {
			HashMap<String, Object> record = new HashMap<String, Object>();
			for (int i=0; i< header.length; ++i) {
				record.put(header[i], Utils.stringToDataType(d[i]));
			}
			record.put("meta_id",objectId);
			records.add(record);
			
		}


		boolean res = mongo.bulkInsert(records);


		if (res) {
			return new Response(res, "Upload Success", objectId);
		}

		return new Response(res, "Upload Failure", "");




	}



}
