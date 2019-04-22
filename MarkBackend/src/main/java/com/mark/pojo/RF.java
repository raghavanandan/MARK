package com.mark.pojo;

import com.mark.utils.Utils;

public class RF{
	
	private int[] maxBins;
	private int[] maxDepth;
	private double[] minInfoGain;
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
	public double[] getMinInfoGain() {
		return minInfoGain;
	}
	public void setMinInfoGain(String minInfoGain) {
		this.minInfoGain = Utils.getDouble(minInfoGain);
	}
	public int[] getNumTrees() {
		return numTrees;
	}
	public void setNumTrees(String numTrees) {
		this.numTrees = Utils.getInt(numTrees);
	}
	
	
	
	
	
}