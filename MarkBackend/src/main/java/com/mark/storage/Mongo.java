package com.mark.storage;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.BSON;
import org.bson.types.ObjectId;
import org.dmg.pmml.Array;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.mortbay.util.ajax.JSON;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.esotericsoftware.kryo.util.IntMap;
import com.google.gson.Gson;
import com.mongodb.BasicDBObject;
import com.mongodb.BulkWriteOperation;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;

import javassist.bytecode.Descriptor.Iterator;


@Component
public class Mongo {

	@Autowired
	private MongoClient mc;



	public void testCon() {
		System.out.println("inside test con");
		MongoDatabase db = mc.getDatabase("mark");
		db.createCollection("mohit_lund");
	}


	public JSONObject getDoc(String docId) {
		MongoDatabase db = mc.getDatabase("mark");
		MongoCollection<Document> metaCol = db.getCollection("docsMeta");
		MongoCollection<Document> uploadCol = db.getCollection("uploadData");
		ObjectId oid = new ObjectId(docId);
		Bson bsonFilter = Filters.eq("_id",oid);
		FindIterable<Document> meta = metaCol.find(bsonFilter).projection(Projections.excludeId());
		bsonFilter = Filters.eq("meta_id",docId);
		FindIterable<Document> uploadData = uploadCol.find(bsonFilter).projection(Projections.exclude(Arrays.asList("_id","meta_id")));
		
		List<Document> uploadDocs = new ArrayList<>();
		for(Document doc : uploadData) {
//			System.out.println("inside loop "+doc.getString("country"));
			uploadDocs.add(doc);
		}
		
		Document metaInfo = meta.first();
		
		JSONObject obj = new JSONObject();
		
		obj.put("header", metaInfo.get("header"));
		
		obj.put("docs", uploadDocs);
		
//		System.out.println(obj);
		
		return obj;
		

	}
	
	
	public JSONArray getDocs() {
		MongoDatabase db = mc.getDatabase("mark");
		MongoCollection<Document> metaCol = db.getCollection("docsMeta");
		FindIterable<Document> meta = metaCol.find();
		JSONArray jsArray = new JSONArray();
		for(Document doc : meta) {
//			System.out.println("inside loop "+doc.getString("country"));
			jsArray.add(doc);
		}
		return jsArray;
	}
	

	public String insertOne(String js) {
		MongoDatabase db = mc.getDatabase("mark");
		MongoCollection<Document> col = db.getCollection("docsMeta");

		Document doc = Document.parse(js);
		col.insertOne(doc);
		return doc.getObjectId("_id").toString();
	}


	public boolean bulkInsert(ArrayList<HashMap<String, Object>> records) {

		MongoDatabase db = mc.getDatabase("mark");
		//		BulkWriteOperation collection = ((DBCollection) db.getCollection("upload")).initializeUnorderedBulkOperation();

		MongoCollection<Document> col = db.getCollection("uploadData");


		List<Document> documents = new ArrayList<Document>();

		for(HashMap<String, Object> rec : records) {

			Document d = new Document();

			for(String key: rec.keySet())
			{
				d.append(key, rec.get(key));
			}

			documents.add(d);
		}

		col.insertMany(documents);

		return true;


	}


	public String insertFileMeta(String js, JSONObject info) {
		MongoDatabase db = mc.getDatabase("mark");
		MongoCollection<Document> col = db.getCollection("docsMeta");

		Document doc = Document.parse(js);
		col.insertOne(doc);
		return doc.getObjectId("_id").toString();
	}


}