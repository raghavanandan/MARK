package com.mark.pojo;

import java.util.HashMap;

public class Query{
	 
	private String column;
	private HashMap<String, String> operation;
	
	public String getColumn() {
		return column;
	}
	public void setColumn(String column) {
		this.column = column;
	}
	public HashMap<String, String> getOperation() {
		return operation;
	}
	public void setOperation(HashMap<String, String> operation) {
		this.operation = operation;
	}
	
	@Override
	public String toString() {
		return "Query [column=" + column + ", operation=" + operation + "]";
	}
	
}