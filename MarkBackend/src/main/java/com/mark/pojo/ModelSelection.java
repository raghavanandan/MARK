package com.mark.pojo;

import java.util.List;

public class ModelSelection{
	
	
	private String outputCol;
	private List<String> featureCol;
	private int trainSplit;
	private int testSplit;
	private String model;
	
	public String getOutputCol() {
		return outputCol;
	}
	public void setOutputCol(String outputCol) {
		this.outputCol = outputCol;
	}
	public List<String> getFeatureCol() {
		return featureCol;
	}
	public void setFeatureCol(List<String> featureCol) {
		this.featureCol = featureCol;
	}
	public int getTrainSplit() {
		return trainSplit;
	}
	public void setTrainSplit(int trainSplit) {
		this.trainSplit = trainSplit;
	}
	public int getTestSplit() {
		return testSplit;
	}
	public void setTestSplit(int testSplit) {
		this.testSplit = testSplit;
	}
	public String getModel() {
		return model;
	}
	public void setModel(String model) {
		this.model = model;
	}
	
	@Override
	public String toString() {
		return "ModelSelection [outputCol=" + outputCol + ", featureCol=" + featureCol + ", trainSplit=" + trainSplit
				+ ", testSplit=" + testSplit + ", model=" + model + "]";
	}
	
}