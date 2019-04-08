package com.mark.controller;

import java.io.IOException;
import java.util.List;

import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.mark.pojo.Response;
import com.mark.storage.Mongo;
import com.mark.utils.FileParser;
import com.mark.utils.FileUploader;
import com.mark.utils.Test;


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
	
//	@Autowired
//	private Test test;

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

		System.out.println(result);


		return new ResponseEntity<>(result, HttpStatus.OK);
	}

//	@RequestMapping("run-model")
//	public ResponseEntity<Response> runModel() {
//
//		return new ResponseEntity<>(test.run(), HttpStatus.OK);
//	}





}
