package com.mark.pojo;

public class MissingData{
	private String oldColumnName;
	private String newColumnName;
	private String value;
	private String columnType;
	
	@Override
	public String toString() {
		return "MissingData [oldColumnName=" + oldColumnName + ", newColumnName=" + newColumnName + ", value=" + value
				+ ", columnType=" + columnType + "]";
	}
	public String getOldColumnName() {
		return oldColumnName;
	}
	public void setOldColumnName(String oldColumnName) {
		this.oldColumnName = oldColumnName;
	}
	public String getNewColumnName() {
		return newColumnName;
	}
	public void setNewColumnName(String newColumnName) {
		this.newColumnName = newColumnName;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public String getColumnType() {
		return columnType;
	}
	public void setColumnType(String columnType) {
		this.columnType = columnType;
	}
	
}