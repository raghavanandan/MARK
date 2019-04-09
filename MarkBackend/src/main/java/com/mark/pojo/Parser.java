package com.mark.pojo;

import java.util.List;

public class Parser{
	private List<Query> queries;
	private String docId;

	public List<Query> getQueries() {
		return queries;
	}

	public void setQueries(List<Query> queries) {
		this.queries = queries;
	}

	public String getDocId() {
		return docId;
	}

	public void setDocId(String docId) {
		this.docId = docId;
	}

	@Override
	public String toString() {
		return "Parser [queries=" + queries + ", docId=" + docId + "]";
	} 
	
}