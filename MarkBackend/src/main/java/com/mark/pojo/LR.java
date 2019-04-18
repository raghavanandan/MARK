package com.mark.pojo;


public class LR{
	
	private  double elasticNetParam;
	private int maxIter;
	private double regParam;
	private double tol;
	
	public double getElasticNetParam() {
		return elasticNetParam;
	}
	public void setElasticNetParam(double elasticNetParam) {
		this.elasticNetParam = elasticNetParam;
	}
	public int getMaxIter() {
		return maxIter;
	}
	public void setMaxIter(int maxIter) {
		this.maxIter = maxIter;
	}
	public double getRegParam() {
		return regParam;
	}
	public void setRegParam(double regParam) {
		this.regParam = regParam;
	}
	public double getTol() {
		return tol;
	}
	public void setTol(double tol) {
		this.tol = tol;
	}
	
	
}