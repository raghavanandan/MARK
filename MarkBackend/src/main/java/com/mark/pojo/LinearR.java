package com.mark.pojo;

import java.util.Arrays;

import com.mark.utils.Utils;

public class LinearR{
	
	
	private  double[] elasticNetParam;
	private int[] maxIter;
	private double[] tol;
	
	public double[] getElasticNetParam() {
		return elasticNetParam;
	}
	public void setElasticNetParam(String elasticNetParam) {
		this.elasticNetParam = Utils.getDouble(elasticNetParam);
	}
	public int[] getMaxIter() {
		return maxIter;
	}
	public void setMaxIter(String maxIter) {
		this.maxIter = Utils.getInt(maxIter);
	}
	
	public double[] getTol() {
		return tol;
	}
	public void setTol(String tol) {
		this.tol = Utils.getDouble(tol);
	}
	@Override
	public String toString() {
		return "LinearR [elasticNetParam=" + Arrays.toString(elasticNetParam) + ", maxIter=" + Arrays.toString(maxIter)
				+ ", tol=" + Arrays.toString(tol) + "]";
	}
	
	
	
}