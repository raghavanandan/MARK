package com.mark.pojo;

import com.mark.utils.Utils;

public class GBT{
	
	private int[] maxBins;
	private int[] maxDepth;
	private int[] stepSize;
	private int[] numTrees;
	
	public int[] getMaxBins() {
		return maxBins;
	}
	public void setMaxBins(String maxBins) {
		this.maxBins = Utils.getInt(maxBins);
	}
	public int[] getMaxDepth() {
		return maxDepth;
	}
	public void setMaxDepth(String maxDepth) {
		this.maxDepth = Utils.getInt(maxDepth);
	}
	public int[] getStepSize() {
		return stepSize;
	}
	public void setStepSize(String stepSize) {
		this.stepSize = Utils.getInt(stepSize);
	}
	public int[] getNumTrees() {
		return numTrees;
	}
	public void setNumTrees(String numTrees) {
		this.numTrees = Utils.getInt(numTrees);
	}
	
	
	
	
}