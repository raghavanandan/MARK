package com.mark.pojo;

import com.mark.utils.Utils;

public class DT{
	
	private int[] maxBins;
	private int[] maxDepth;
	private double[] minInfoGain;
	private int[] minInstancesperNode;
	
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
	public int[] getMinInstancesperNode() {
		return minInstancesperNode;
	}
	public void setMinInstancesperNode(String minInstancesPerNode) {
		this.minInstancesperNode = Utils.getInt(minInstancesPerNode);
	}
	
	
	
	
	
}