package com.mark.controller;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.ml.Pipeline;
import org.apache.spark.ml.PipelineModel;
import org.apache.spark.ml.PipelineStage;
import org.apache.spark.ml.Transformer;
import org.apache.spark.ml.classification.DecisionTreeClassificationModel;
import org.apache.spark.ml.classification.DecisionTreeClassifier;
import org.apache.spark.ml.classification.LogisticRegression;
import org.apache.spark.ml.classification.LogisticRegressionModel;
import org.apache.spark.ml.classification.NaiveBayes;
import org.apache.spark.ml.classification.NaiveBayesModel;
import org.apache.spark.ml.classification.RandomForestClassificationModel;
import org.apache.spark.ml.classification.RandomForestClassifier;
import org.apache.spark.ml.classification.GBTClassificationModel;
import org.apache.spark.ml.classification.GBTClassifier;
import org.apache.spark.ml.feature.IndexToString;
import org.apache.spark.ml.feature.OneHotEncoder;
import org.apache.spark.ml.feature.StringIndexer;
import org.apache.spark.ml.feature.StringIndexerModel;
import org.apache.spark.ml.feature.VectorAssembler;
import org.apache.spark.mllib.evaluation.MulticlassMetrics;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.bson.Document;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.mark.pojo.ModelSelection;
import com.mark.pojo.Response;
import com.mark.pojo.StringParser;
import com.mark.storage.Mongo;
import com.mark.utils.FileParser;
import com.mark.utils.FileUploader;
import com.mark.utils.QueryParser;
import com.mark.utils.Utils;

import scala.Tuple2;


@CrossOrigin(origins="http://localhost:3000")
@RequestMapping("api")
@Controller
public class ApiController {
	@Autowired
	WordCount wordCount;

	@Autowired
	FileParser fileParser;

	@Autowired
	private Mongo mongo;

	@Autowired
	QueryParser queryParser;

	@Autowired
	private SparkSession sparkSession;

	private static Dataset<Row> masterDf;

	private static Dataset<Row> currentDf;

	private static PipelineModel pipelineModel;

	private static Dataset<Row> training;

	private static Dataset<Row> testing;

	@RequestMapping("wordcount")
	public ResponseEntity<List<Count>> words() {
		return new ResponseEntity<>(wordCount.count(), HttpStatus.OK);
	}

	@RequestMapping(value = "upload-file", method = RequestMethod.POST, produces =MediaType.APPLICATION_JSON_VALUE )
	public ResponseEntity<Response> uploadFile(@RequestParam("file") MultipartFile file){

		String fpath = null;
		try {
			fpath = FileUploader.storeFile(file);
		} catch (IllegalStateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("filepath: "+fpath);

		return new ResponseEntity<>(fileParser.parseFile(fpath), HttpStatus.OK);
	}

	@RequestMapping("get-doc")
	public ResponseEntity<JSONObject> getDoc(@RequestParam("docId") String docId) {

		JSONObject result = mongo.getDoc(docId);

		return new ResponseEntity<>(result, HttpStatus.OK);
	}


	@RequestMapping("reset-frame")
	public ResponseEntity<JSONObject> resetFrame() {

		currentDf = masterDf;

		List<Row> x = masterDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = masterDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}

	@RequestMapping("get-frame")
	public ResponseEntity<JSONObject> currentFrame(@RequestParam("frame") String frame) {

		if (currentDf ==null) {
			currentDf = masterDf;
		}


		Dataset<Row> frameDf = null;

		switch (frame) {
		case "master":
			frameDf = masterDf;

			break;

		case "current":
			frameDf = currentDf;

			break;

		default:
			frameDf = masterDf;
			break;
		}


		List<Row> x = frameDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = frameDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping("create-master-df")
	public ResponseEntity<JSONObject> createMasterDataFrame(@RequestParam("docId") String docId) {

		JSONObject result = mongo.getDoc(docId);
		JavaSparkContext sc = JavaSparkContext.fromSparkContext(sparkSession.sparkContext());
		JSONArray jsn = new JSONArray();

		List<Document> jsonArray = (List<Document>) result.get("docs");

		for (Document obj :jsonArray) {
			jsn.add(obj);
		}
		try (FileWriter file = new FileWriter("/tmp/file1.txt")) {
			file.write(jsn.toJSONString());
			System.out.println("Successfully Copied JSON Object to File...");

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		masterDf = sparkSession.read().json("/tmp/file1.txt");
		masterDf.show();


		List<Row> x = masterDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = masterDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping("create-view")
	public ResponseEntity<Response> createView(@RequestParam("viewName") String viewName) {

		if (currentDf ==null) {
			currentDf = masterDf;
		}

		currentDf.createOrReplaceTempView(viewName);

		Response res = new Response(true, "View created", viewName);

		return new ResponseEntity<>(res, HttpStatus.OK);

	}



	@RequestMapping("select-df")
	public ResponseEntity<JSONObject> selectDataFrame(@RequestParam("columns") List<String> columns) {

		JavaSparkContext sc = JavaSparkContext.fromSparkContext(sparkSession.sparkContext());

		if (currentDf ==null) {
			currentDf = masterDf;
		}

		String[] p = columns.toArray(new String[0]);

		for (String s :p) {
			System.out.println(s);
		}

		currentDf.show();

		currentDf = currentDf.selectExpr(p);


		List<Row> x = currentDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);


		Tuple2<String, String>[] dtypes = currentDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping(value = "filter-column", method = RequestMethod.POST )
	public ResponseEntity<JSONObject> filterColumn(@RequestBody StringParser parser) {


		if (currentDf ==null) {
			currentDf = masterDf;
		}

		currentDf = sparkSession.sql(parser.getRawQuery());
		List<Row> x = currentDf.collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = currentDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping(value="visualizations")
	public ResponseEntity<JSONObject> visualizations(@RequestParam String column, @RequestParam String column_type){



		if (currentDf ==null) {
			currentDf = masterDf;
		}

		Dataset<Row> groupFrame = currentDf.groupBy(currentDf.col(column)).count();
		JSONObject js = Utils.convertFrameToJson2(groupFrame.collectAsList());

		Tuple2<String, String>[] dtypes = groupFrame.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);
		return new ResponseEntity<>(js, HttpStatus.OK);

	}


	@RequestMapping(value="visualizations-multiple")
	public ResponseEntity<JSONObject> visualizationsMultiple(@RequestParam("columns") List<String> columns){


		if (currentDf == null) {
			currentDf = masterDf;
		}

		Dataset<Row> groupFrame = currentDf.select(currentDf.col(columns.get(0)),currentDf.col(columns.get(1)));
		JSONObject js = Utils.convertFrameToJson2(groupFrame.collectAsList());

		Tuple2<String, String>[] dtypes = groupFrame.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);
		return new ResponseEntity<>(js, HttpStatus.OK);

	}

	@RequestMapping(value="statistics")
	public ResponseEntity<JSONObject> statistics(@RequestParam("columns") List<String> columns){

		if (currentDf == null) {
			currentDf = masterDf;
		}

		String[] cols = new String[columns.size()];
		cols = columns.toArray(cols);

		Dataset<Row> stats = currentDf.describe();

		Dataset<Row> col1 = stats.select(stats.col("summary"), stats.col(columns.get(0)));


		if (columns.size()>1) {
			col1 = stats.select(stats.col("summary"), stats.col(columns.get(0)),stats.col(columns.get(1)));
		}

		JSONObject js = Utils.convertFrameToJson2(col1.collectAsList());

		Tuple2<String, String>[] dtypes = col1.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);
		return new ResponseEntity<>(js, HttpStatus.OK);

	}

	private static void resetModel() {
		training = null;
		testing = null;
		pipelineModel = null;
	}


	@RequestMapping(value="prepare-model",  method = RequestMethod.POST, produces =MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JSONObject> prepareModel(@RequestBody ModelSelection modelSelection){

		System.out.println("ModelData "+modelSelection);

		resetModel();

		StringIndexer tr = new StringIndexer().setInputCol(modelSelection.getOutputCol()).setOutputCol("label");

		ArrayList<PipelineStage> stages = new ArrayList<>();

		stages.add(tr);

		List<String> categorical = new ArrayList<>();

		List<String> numerical = new ArrayList<>();


		if (currentDf == null) {
			currentDf = masterDf;
		}


		for(Tuple2<String, String> tup: currentDf.dtypes()){
			if(tup._1 == "label")

				continue;

			if(tup._2 == "StringType") {
				categorical.add(tup._1);
			}
			else {
				numerical.add(tup._1);
			}

		}



		for(String str: categorical){

			StringIndexer strIndexer = new StringIndexer().setInputCol(str).setOutputCol(str + "Index");
			OneHotEncoder encoder = new OneHotEncoder().setInputCol(strIndexer.getOutputCol()).setOutputCol(str + "classVec");

			stages.add(strIndexer);
			stages.add(encoder);
		}

		List<String> assemblerInputs = new ArrayList<>(numerical);
		for(String str: categorical) {
			assemblerInputs.add(str + "classVec");
		}

		VectorAssembler assembler = new VectorAssembler().setInputCols(assemblerInputs.toArray(new String[0])).setOutputCol("features");
		stages.add(assembler);

		Pipeline partialPipeline = new Pipeline().setStages(stages.toArray(new PipelineStage[0]));

		pipelineModel = partialPipeline.fit(currentDf);

		Dataset<Row> preppedDataDF = pipelineModel.transform(currentDf);

		System.out.println(modelSelection.getTestSplit()/100.0);

		System.out.println(modelSelection.getTrainSplit()/100.0);

		Dataset<Row>[] ds = preppedDataDF.randomSplit(new double[] {modelSelection.getTrainSplit()/100.0, modelSelection.getTestSplit()/100.0});

		training = ds[0];
		testing = ds[1];

		preppedDataDF.show();
		
		
		List<Row> training_json = training.collectAsList();
		JSONObject training_set = Utils.convertFrameToJson2Cols(training_json, currentDf.columns());
		List<Row> testing_json = testing.collectAsList();
		JSONObject testing_set = Utils.convertFrameToJson2Cols(testing_json, currentDf.columns());
		
		JSONObject res = new JSONObject();
		
		res.put("training_set", training_set);
		res.put("testing_set", testing_set);
		
		Tuple2<String, String>[] dtypes = currentDf.dtypes();
		
		JSONArray header = Utils.getTypes(dtypes);

		res.put("header", header);

		return new ResponseEntity<>(res, HttpStatus.OK);

	}


	@RequestMapping(value="run-predict")
	public ResponseEntity<Response> runPredict(){

		//LogisticRegressionModel lrModel = new LogisticRegression().fit(training);

		NaiveBayesModel lrModel = new NaiveBayes().fit(training);

		Dataset<Row> predictions = lrModel.transform(testing);
		predictions.show();

		Transformer[] _stages = pipelineModel.stages();

		StringIndexerModel temp = (StringIndexerModel)_stages[0];


		IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
		predictions = trs.transform(predictions);

		predictions.show();


		//		RDD<Row> temp_rdd = testing.select("sexIndex", "prediction").map(new Function1<Row, Tuple2>(){});





		MulticlassMetrics metrics = new MulticlassMetrics(predictions.select("SexIndex", "prediction"));

		System.out.println(metrics.accuracy());
		System.out.println(metrics.fMeasure());

		return null;


		//lr, nb, dtree, rforest, gradientbTrees
	}

	@RequestMapping(value="predict")
	public ResponseEntity<JSONObject> predict(@RequestBody Map<String, Object> modelJson){

		System.out.println(modelJson);

		LogisticRegressionModel lrModel = null;
		DecisionTreeClassificationModel dtModel= null;
		NaiveBayesModel nbModel= null;
		RandomForestClassificationModel rfModel = null;
		GBTClassificationModel gbtModel = null;

		String outputCol = (String) modelJson.get("outputCol");

		List<Map<String, Object>> it = (List<Map<String, Object>>) modelJson.get("data");

		JSONObject res = new JSONObject();

		for (Map<String, Object> model :  it) {
			
			
			
//			if (model.get("model").equals("logistic_regression")){
//				MulticlassClassificationEvaluator mce = new MulticlassClassificationEvaluator().setPredictionCol("prediction").setLabelCol("label");
//		     	LogisticRegression lr = new LogisticRegression();
//		     	ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(lr.elasticNetParam(), new double[] {0.0, 0.5, 1.0}).addGrid(lr.regParam(), new double[] {0.01, 0.5, 2.0}).addGrid(lr.maxIter(), new int[] {1, 5, 10});
//		     	ParamMap[] pMap = paramGrid.build();
//		     	CrossValidator cv = new CrossValidator().setNumFolds(5).setEstimator(lr).setEstimatorParamMaps(pMap).setEvaluator(mce);
//		     	CrossValidatorModel cvm = cv.fit(training);
//		     	System.out.println(cvm.explainParams());
//		     	System.out.println(cvm.bestModel().explainParams());
//		     	Dataset<Row> predictions2 = cvm.transform(testing);
//		     	for(double d : cvm.avgMetrics()) {
//		     		System.out.println(d);
//		     	}
//		     	predictions2.show();
//		     	System.out.println(mce.evaluate(predictions2));
//			}
			

			if (model.get("model").equals("logistic_regression")){
				lrModel = new LogisticRegression().fit(training);
				Dataset<Row> predictions = lrModel.transform(testing);
				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select(outputCol+"Index", "prediction"));

				System.out.println(metrics.accuracy());
				System.out.println(metrics.fMeasure());
				Dataset<Row> p_orginal = predictions.select("prediction-original");
				double acc = metrics.accuracy();
				double fMeasure = metrics.fMeasure();
				double precision = metrics.precision();
				double recall = metrics.recall();

				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());

				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", acc);
				temp_res.put("fMeasure", fMeasure);
				temp_res.put("precision", precision);
				temp_res.put("recall", recall);

				res.put(model.get("model"), temp_res);




			}
			if (model.get("model").equals("decision_tree")){
				dtModel = new DecisionTreeClassifier().fit(training);
				Dataset<Row> predictions = dtModel.transform(testing);
				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select(outputCol+"Index", "prediction"));

				System.out.println(metrics.accuracy());
				System.out.println(metrics.fMeasure());

				Dataset<Row> p_orginal = predictions.select("prediction-original");
				double acc = metrics.accuracy();
				double fMeasure = metrics.fMeasure();
				double precision = metrics.precision();
				double recall = metrics.recall();


				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());

				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", acc);
				temp_res.put("fMeasure", fMeasure);
				temp_res.put("precision", precision);
				temp_res.put("recall", recall);

				res.put(model.get("model"), temp_res);


			}
			if (model.get("model").equals("naive_bayes")){
				nbModel = new NaiveBayes().fit(training);
				Dataset<Row> predictions = nbModel.transform(testing);
				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select(outputCol+"Index", "prediction"));

				System.out.println(metrics.accuracy());
				System.out.println(metrics.fMeasure());

				Dataset<Row> p_orginal = predictions.select("prediction-original");
				double acc = metrics.accuracy();
				double fMeasure = metrics.fMeasure();
				double precision = metrics.precision();
				double recall = metrics.recall();


				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());

				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", acc);
				temp_res.put("fMeasure", fMeasure);
				temp_res.put("precision", precision);
				temp_res.put("recall", recall);

				res.put(model.get("model"), temp_res);



			}
			
			if (model.get("model").equals("random_forest")){
				rfModel = new RandomForestClassifier().fit(training);
				Dataset<Row> predictions = rfModel.transform(testing);
				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select(outputCol+"Index", "prediction"));

				System.out.println(metrics.accuracy());
				System.out.println(metrics.fMeasure());

				Dataset<Row> p_orginal = predictions.select("prediction-original");
				double acc = metrics.accuracy();
				double fMeasure = metrics.fMeasure();

				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());

				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", acc);
				temp_res.put("fMeasure", fMeasure);

				res.put(model.get("model"), temp_res);
			}
			
			if (model.get("model").equals("gradient_boosted_trees")){
				gbtModel = new GBTClassifier().fit(training);
				Dataset<Row> predictions = gbtModel.transform(testing);
				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select(outputCol+"Index", "prediction"));

				System.out.println(metrics.accuracy());
				System.out.println(metrics.fMeasure());

				Dataset<Row> p_orginal = predictions.select("prediction-original");
				double acc = metrics.accuracy();
				double fMeasure = metrics.fMeasure();

				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());

				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", acc);
				temp_res.put("fMeasure", fMeasure);

				res.put(model.get("model"), temp_res);



			}





		}

		return new ResponseEntity<>(res, HttpStatus.OK);

	}






}
