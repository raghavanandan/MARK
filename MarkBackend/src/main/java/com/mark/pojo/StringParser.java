package com.mark.pojo;

public class StringParser{
	
	@Override
	public String toString() {
		return "StringParser [rawQuery=" + rawQuery + "]";
	}

	private String rawQuery;
	private String viewName;

	public String getViewName() {
		return viewName;
	}

	public void setViewName(String viewName) {
		this.viewName = viewName;
	}

	public String getRawQuery() {
		return rawQuery;
	}

	public void setRawQuery(String rawQuery) {
		this.rawQuery = rawQuery;
	}
	
}