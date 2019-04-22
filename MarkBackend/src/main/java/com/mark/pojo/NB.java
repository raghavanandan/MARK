package com.mark.pojo;

import com.mark.utils.Utils;

public class NB{
	
	private double[] smoothing;

	public double[] getSmoothing() {
		return smoothing;
	}

	public void setSmoothing(String smoothing) {
		this.smoothing = Utils.getDouble(smoothing);
	}

	
	
}