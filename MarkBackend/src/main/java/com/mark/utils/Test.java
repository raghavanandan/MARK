package com.mark.utils;

import java.util.Arrays;
import java.util.List;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.mllib.classification.NaiveBayes;
import org.apache.spark.mllib.classification.NaiveBayesModel;
import org.apache.spark.mllib.regression.LabeledPoint;
import org.apache.spark.mllib.util.MLUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mark.pojo.Response;

import scala.Tuple2;

@Component
public class Test {
		
	
	
	public static void run() {
		
		SparkConf conf = new SparkConf().setAppName("LogisticRegression").setMaster("local");
		JavaSparkContext jsc = new JavaSparkContext(conf);
		
//		System.out.println(sparkConf.get("master"));
//	    
	   
	    // $example on$
	    String path = "/tmp/iris.libsvm";
	    System.out.println(jsc);
	    JavaRDD<LabeledPoint> inputData = MLUtils.loadLibSVMFile(jsc.sc(), path).toJavaRDD();
	    JavaRDD<LabeledPoint>[] tmp = inputData.randomSplit(new double[]{0.6, 0.4});
	    JavaRDD<LabeledPoint> training = tmp[0]; // training set
	    JavaRDD<LabeledPoint> test = tmp[1]; // test set
	    NaiveBayesModel model = NaiveBayes.train(training.rdd(), 1.0);
	    JavaPairRDD<Double, Double> predictionAndLabel =
	      test.mapToPair(p -> new Tuple2<>(model.predict(p.features()), p.label()));
	    
	    predictionAndLabel.foreach(new VoidFunction<Tuple2<Double, Double>>() {

	        public void call(Tuple2<Double, Double> tuple) throws Exception {
	            
	            System.out.print(tuple);
	        }
	    });
	    
	    double accuracy =
	      predictionAndLabel.filter(pl -> pl._1().equals(pl._2())).count() / (double) test.count();
	    System.out.println(accuracy);
	    // Save and load model
	    model.save(jsc.sc(), "/tmp/myNaiveBayesModel");
	    NaiveBayesModel sameModel = NaiveBayesModel.load(jsc.sc(), "/tmp/myNaiveBayesModel");
	    
//	    Vector testData = Vectors.dense);	
	    List<Double> xyz = Arrays.asList(5.8d,4.0d,1.2d,0.0d);
//	    abc = jsc.sc().parallelize(xyz);
//	    LinkedList<Vector> rowsList = new LinkedList<>();
//	    rowsList.add(testData);
//	    JavaRDD<Double> rows = jsc.sc().parallelize(xyz);
//	    sameModel.pe
	    // $example off$

	    jsc.stop();
	}
	

	public static void main(String[] args) {
		run();
	}

	
}
