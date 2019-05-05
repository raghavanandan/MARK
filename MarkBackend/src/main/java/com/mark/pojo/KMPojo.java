package com.mark.pojo;

import java.util.Arrays;

import com.mark.utils.Utils;

public class KMPojo{
	
	private int[] k;

	public int[] getK() {
		return k;
	}

	public void setK(String k) {
		this.k = Utils.getInt(k);
	}

	@Override
	public String toString() {
		return "KMPojo [k=" + Arrays.toString(k) + "]";
	}
	
}