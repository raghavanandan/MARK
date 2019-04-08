package com.mark.pojo;


public class Response{
	
	
	private boolean status;
	private String message;
	private String docId;
	
	
	

	public String getDocId() {
		return docId;
	}

	public void setDocId(String docId) {
		this.docId = docId;
	}

	public Response(boolean status, String message, String docId) {
		super();
		this.status = status;
		this.message = message;
		this.docId = docId;
	}
	
	public boolean isStatus() {
		return status;
	}
	
	public void setStatus(boolean status) {
		this.status = status;
	}
	
	public String getMessage() {
		return message;
	}
	
	public void setMessage(String message) {
		this.message = message;
	}
	
	
	
}