package com.mark.pojo;

import java.util.Arrays;

import com.mark.utils.Utils;

public class BisectingKMPojo{
	
	private int[] k;
	private int[] maxIter;
	private double[] minDivisibleClusterSize;
	

	public int[] getMaxIter() {
		return maxIter;
	}

	public void setMaxIter(String maxIter) {
		this.maxIter = Utils.getInt(maxIter);
	}

	public double[] getMinDivisibleClusterSize() {
		return minDivisibleClusterSize;
	}

	public void setMinDivisibleClusterSize(String minDivisibleClusterSize) {
		this.minDivisibleClusterSize = Utils.getDouble(minDivisibleClusterSize);
	}

	public int[] getK() {
		return k;
	}

	public void setK(String k) {
		this.k = Utils.getInt(k);
	}

	@Override
	public String toString() {
		return "BisectingKMPojo [k=" + Arrays.toString(k) + ", maxIter=" + Arrays.toString(maxIter)
				+ ", minDivisibleClusterSize=" + Arrays.toString(minDivisibleClusterSize) + "]";
	}

	
}