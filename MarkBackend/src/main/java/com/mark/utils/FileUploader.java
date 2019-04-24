package com.mark.utils;

import java.io.File;
import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public class FileUploader {
	
	private final static String uploadingDir = "/tmp/";
	
	public static String storeFile(MultipartFile uploadedFile) throws IllegalStateException, IOException {
		File f = new File(uploadingDir + Utils.getRandomKey());
		uploadedFile.transferTo(f);
		return f.getAbsolutePath(); 
		
	}

}
