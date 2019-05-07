package com.mark.controller;

import java.io.FileWriter;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.ml.Pipeline;
import org.apache.spark.ml.PipelineModel;
import org.apache.spark.ml.PipelineStage;
import org.apache.spark.ml.Transformer;
import org.apache.spark.ml.classification.BinaryLogisticRegressionSummary;
import org.apache.spark.ml.classification.DecisionTreeClassificationModel;
import org.apache.spark.ml.classification.DecisionTreeClassifier;
import org.apache.spark.ml.classification.GBTClassificationModel;
import org.apache.spark.ml.classification.GBTClassifier;
import org.apache.spark.ml.classification.LogisticRegression;
import org.apache.spark.ml.classification.LogisticRegressionModel;
import org.apache.spark.ml.classification.NaiveBayes;
import org.apache.spark.ml.classification.NaiveBayesModel;
import org.apache.spark.ml.classification.RandomForestClassificationModel;
import org.apache.spark.ml.classification.RandomForestClassifier;
import org.apache.spark.ml.clustering.BisectingKMeans;
import org.apache.spark.ml.clustering.BisectingKMeansModel;
import org.apache.spark.ml.clustering.BisectingKMeansSummary;
import org.apache.spark.ml.clustering.KMeans;
import org.apache.spark.ml.clustering.KMeansModel;
import org.apache.spark.ml.clustering.KMeansSummary;
import org.apache.spark.ml.evaluation.ClusteringEvaluator;
import org.apache.spark.ml.evaluation.MulticlassClassificationEvaluator;
import org.apache.spark.ml.evaluation.RegressionEvaluator;
import org.apache.spark.ml.feature.IndexToString;
import org.apache.spark.ml.feature.OneHotEncoder;
import org.apache.spark.ml.feature.StringIndexer;
import org.apache.spark.ml.feature.StringIndexerModel;
import org.apache.spark.ml.feature.VectorAssembler;
import org.apache.spark.ml.linalg.Vector;
import org.apache.spark.ml.param.ParamMap;
import org.apache.spark.ml.regression.DecisionTreeRegressionModel;
import org.apache.spark.ml.regression.DecisionTreeRegressor;
import org.apache.spark.ml.regression.LinearRegression;
import org.apache.spark.ml.regression.LinearRegressionModel;
import org.apache.spark.ml.regression.RandomForestRegressionModel;
import org.apache.spark.ml.regression.RandomForestRegressor;
import org.apache.spark.ml.tuning.CrossValidator;
import org.apache.spark.ml.tuning.CrossValidatorModel;
import org.apache.spark.ml.tuning.ParamGridBuilder;
import org.apache.spark.mllib.evaluation.MulticlassMetrics;
import org.apache.spark.mllib.evaluation.RegressionMetrics;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.functions;
import org.apache.spark.sql.catalyst.expressions.GenericRowWithSchema;
import org.apache.spark.sql.types.DataTypes;
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

import com.mark.pojo.BisectingKMPojo;
import com.mark.pojo.DT;
import com.mark.pojo.FramePojo;
import com.mark.pojo.KMPojo;
import com.mark.pojo.LR;
import com.mark.pojo.LinearR;
import com.mark.pojo.MissingData;
import com.mark.pojo.ModelSelection;
import com.mark.pojo.NB;
import com.mark.pojo.RF;
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

	private static DecimalFormat df2 = new DecimalFormat("#.##");

	private static final int limit = 50;

	private static Map<String, Map<FramePojo,Dataset<Row>>> masterFrames = new HashMap<>();

	private static String master_frame_id;

	@RequestMapping(value = "upload-file", method = RequestMethod.POST, produces =MediaType.APPLICATION_JSON_VALUE )
	public ResponseEntity<Response> uploadFile(@RequestParam("file") MultipartFile file,@RequestParam("name") String name, @RequestParam("description") String description, @RequestParam("header") String header){

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

		return new ResponseEntity<>(fileParser.parseFile(fpath, name, description, Boolean.parseBoolean(header)), HttpStatus.OK);
	}

	@RequestMapping("get-doc")
	public ResponseEntity<JSONObject> getDoc(@RequestParam("docId") String docId) {

		JSONObject result = mongo.getDoc(docId);

		return new ResponseEntity<>(result, HttpStatus.OK);
	}

	@RequestMapping("get-docs")
	public ResponseEntity<JSONArray> getDocs() {

		JSONArray result = mongo.getDocs();

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


		List<Row> x = frameDf.limit(limit).collectAsList();
		JSONObject js = Utils.convertFrameToJson2(x);
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = frameDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);
	}


	@RequestMapping("create-master-df")
	public ResponseEntity<Response> createMasterDataFrame(@RequestParam("docId") String docId, @RequestParam("name") String name, @RequestParam("description") String description) {

		JSONObject result = mongo.getDoc(docId);
		System.out.println("mongo fetch");
		JavaSparkContext sc = JavaSparkContext.fromSparkContext(sparkSession.sparkContext());
		System.out.println("appid 1->"+sc.sc().applicationId());
		JSONArray jsn = new JSONArray();

		List<Document> jsonArray = (List<Document>) result.get("docs");

		for (Document obj :jsonArray) {
			jsn.add(obj);
		}
		System.out.println("added json fetch");
		try (FileWriter file = new FileWriter("/tmp/file1.txt")) {
			file.write(jsn.toJSONString());
			System.out.println("Successfully Copied JSON Object to File...");

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("appid 1->"+sc.sc().applicationId());
		Dataset<Row> df = sparkSession.read().json("/tmp/file1.txt");
		//		masterDf.show();
		System.out.println("added masterdf fetch");
		System.out.println("appid 1->"+sc.sc().applicationId());

		FramePojo framePojo = new FramePojo();
		framePojo.setCreatedTimestamp(Calendar.getInstance().getTimeInMillis());
		framePojo.setModifiedTimestamp(Calendar.getInstance().getTimeInMillis());
		framePojo.setName(name);
		framePojo.setDescription(description);

		Map<FramePojo, Dataset<Row>> dataMap = new HashMap<>();
		dataMap.put(framePojo, df);

		masterFrames.put(UUID.randomUUID().toString(), dataMap);

		//		List<Row> x = masterDf.limit(limit).collectAsList();
		//		JSONObject js = Utils.convertFrameToJson2(x);
		//		//		System.out.println(js);
		//		System.out.println("added frameconvert fetch");
		//		Tuple2<String, String>[] dtypes = masterDf.dtypes();
		//
		//		JSONArray header = Utils.getTypes(dtypes);
		//
		//		js.put("header", header);
		Response res = new Response(true, "Frame created", "");

		return new ResponseEntity<>(res, HttpStatus.OK);
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




	@RequestMapping("get-active-frames")
	public ResponseEntity<JSONArray> getActiveFrames() {

		JSONArray jsnArray = new JSONArray();

		for (String key : masterFrames.keySet()) {

			JSONObject obj = new JSONObject();
			Map<FramePojo, Dataset<Row>> frameData = masterFrames.get(key);
			obj.put("frame_id", key);
			for (FramePojo fPojo : frameData.keySet()) {
				obj.put("created_timestamp",fPojo.getCreatedTimestamp());
				obj.put("modified_timestamp", fPojo.getModifiedTimestamp());
				obj.put("name", fPojo.getName());
				obj.put("description", fPojo.getDescription());
			}
			jsnArray.add(obj);	
		}

		return new ResponseEntity<>(jsnArray, HttpStatus.OK);

	}


	@RequestMapping("get-frame-by-id")
	public ResponseEntity<JSONObject> getFrameById(@RequestParam("frameId") String frameId) {

		Map<FramePojo, Dataset<Row>> frameData = masterFrames.get(frameId);
		for (FramePojo fPojo : frameData.keySet()) {
			Dataset<Row> fdf = frameData.get(fPojo);
			masterDf = fdf;
			currentDf = masterDf;
			master_frame_id = frameId;
			List<Row> x = fdf.limit(limit).collectAsList();
			JSONObject js = Utils.convertFrameToJson2(x);
			//		System.out.println(js);
			System.out.println("added frameconvert fetch");
			Tuple2<String, String>[] dtypes = masterDf.dtypes();

			JSONArray header = Utils.getTypes(dtypes);

			js.put("header", header);
			return new ResponseEntity<>(js, HttpStatus.OK);

		}
		return null;


	}



	@RequestMapping("select-df")
	public ResponseEntity<JSONObject> selectDataFrame(@RequestParam("columns") List<String> columns) {

		JavaSparkContext sc = JavaSparkContext.fromSparkContext(sparkSession.sparkContext());

		if (currentDf ==null) {
			currentDf = masterDf;
		}

		String[] exp = new String[columns.size()];


		int i=0;
		for (String s :columns) {
			System.out.println(s);
			exp[i] = "`"+s.trim()+"`";
			i++;
		}

		currentDf.show();

		currentDf = currentDf.selectExpr(exp);


		System.out.println("After filter select-df");

		currentDf.show();

		List<Row> x = currentDf.limit(limit).collectAsList();
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
		List<Row> x = currentDf.limit(limit).collectAsList();
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
		System.out.println("currebt-frame");
		currentDf.show();
		Dataset<Row> groupFrame = currentDf.groupBy(currentDf.col(column)).count();
		System.out.println("group-frame");
		groupFrame.show();
		List<Row> test = groupFrame.takeAsList(2);
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

		stats.show();

		Dataset<Row> col1 = stats.select(stats.col("summary"), stats.col(columns.get(0)));


		if (columns.size()>1) {
			col1 = stats.select(stats.col("summary"), stats.col(columns.get(0)),stats.col(columns.get(1)));
		}

		JSONObject js = Utils.convertFrameToJsonSummary(col1.collectAsList());

		Tuple2<String, String>[] dtypes = col1.dtypes();

		JSONArray header = Utils.getTypes(dtypes);


		if (columns.size()==1) {
			long c = currentDf.filter(currentDf.col(columns.get(0)).isNull()).count() + currentDf.filter(currentDf.col(columns.get(0)).equalTo("")).count();
			js.put("missing_count", c);
			long distinct = currentDf.select(currentDf.col(columns.get(0))).distinct().count();
			js.put("distinct_count", distinct);

			Dataset<Row> mode = currentDf.groupBy(currentDf.col(columns.get(0))).count().sort(functions.desc("count")).limit(1).select(columns.get(0));
			Object _mode = ((GenericRowWithSchema)mode.first()).values()[0];

			js.put("mode", _mode);
			try {
				double[] quantiles = currentDf.stat().approxQuantile(columns.get(0), new double[] {.5}, 0.2);
				JSONObject obj = new JSONObject();
				obj.put("summary", "median");
				obj.put(columns.get(0), quantiles[0]);
				((JSONArray)js.get("docs")).add(obj);
			}
			catch(Exception e) {
				JSONObject obj = new JSONObject();
				obj.put("summary", "median");
				obj.put(columns.get(0), null);
				((JSONArray)js.get("docs")).add(obj);
			}

		}



		js.put("header", header);
		return new ResponseEntity<>(js, HttpStatus.OK);

	}

	private static void resetModel() {
		training = null;
		testing = null;
		pipelineModel = null;
	}

	private static Dataset<Row> prepareClusteringModel(ModelSelection modelSelection) {
		
		ArrayList<PipelineStage> stages = new ArrayList<>();
		List<String> categorical = new ArrayList<>();
		List<String> numerical = new ArrayList<>();
		

		if (currentDf == null) {
			currentDf = masterDf;
		}


		
		Dataset<Row> f_df = currentDf;
		if (!modelSelection.getFeatureCol().get(0).equals("All")) {
//			modelSelection.getFeatureCol().add((modelSelection.getOutputCol()));
			String[] exp = new String[modelSelection.getFeatureCol().size()];
			int i=0;
			for (String s :modelSelection.getFeatureCol()) {
				System.out.println(s);
				exp[i] = "`"+s.trim()+"`";
				i++;
			}


			f_df = currentDf.selectExpr(exp);
		}

		
		
//		if (!modelSelection.getFeatureCol().get(0).equals("All")) {
//			inputCols =  new String[modelSelection.getFeatureCol().size()];
//			int i=0;
//			for (String s :modelSelection.getFeatureCol()) {
//				System.out.println(s);
//				inputCols[i] = s.trim();
//				i++;
//			}
//
//
//		}
//		else {
//			inputCols = currentDf.columns();
//		}
		
		for(Tuple2<String, String> tup: f_df.dtypes()){
			if(tup._1.equals(modelSelection.getOutputCol())) {
				continue;
			}

			if(tup._2 == "StringType") {
				categorical.add(tup._1);
			}
			else {
				numerical.add(tup._1);
				f_df = f_df.withColumn("_" + tup._1 , f_df.col(tup._1).cast(DataTypes.DoubleType)).drop(tup._1).withColumnRenamed("_" + tup._1, tup._1);
			}

		}
		
		List<String> newCat = new ArrayList<>();
		for(String str: categorical){

			StringIndexer strIndexer = new StringIndexer().setInputCol(str).setOutputCol(str + "Index");
			OneHotEncoder encoder = new OneHotEncoder().setInputCol(strIndexer.getOutputCol()).setOutputCol(str + "classVec");

			stages.add(strIndexer);
			if (f_df.select(str).distinct().count() < 2) {
				newCat.add(str+"Index");
				continue;
			}
			else {
				newCat.add(str+"classVec");
			}
			stages.add(encoder);
		}
		
		List<String> assemblerInputs = new ArrayList<>(numerical);
		for(String str: newCat) {
			assemblerInputs.add(str);
		}
		VectorAssembler assembler = new VectorAssembler().setInputCols(assemblerInputs.toArray(new String[0])).setOutputCol("features");
		stages.add(assembler);

		Pipeline partialPipeline = new Pipeline().setStages(stages.toArray(new PipelineStage[0]));

		pipelineModel = partialPipeline.fit(f_df);

		Dataset<Row> preppedDataDF = pipelineModel.transform(f_df);

		System.out.println(modelSelection.getTestSplit()/100.0);

		System.out.println(modelSelection.getTrainSplit()/100.0);

		Dataset<Row>[] ds = preppedDataDF.randomSplit(new double[] {modelSelection.getTrainSplit()/100.0, modelSelection.getTestSplit()/100.0});

		training = ds[0];
		testing = ds[1];

		preppedDataDF.show();
		return f_df;

		
		
		
		
		
		
	}


	private static Dataset<Row> prepareClassficationModel(ModelSelection modelSelection) {

		StringIndexer tr = new StringIndexer().setInputCol(modelSelection.getOutputCol()).setOutputCol("label");

		ArrayList<PipelineStage> stages = new ArrayList<>();

		stages.add(tr);

		List<String> categorical = new ArrayList<>();

		List<String> numerical = new ArrayList<>();



		if (currentDf == null) {
			currentDf = masterDf;
		}


		Dataset<Row> f_df = currentDf;
		if (!modelSelection.getFeatureCol().get(0).equals("All")) {
			modelSelection.getFeatureCol().add((modelSelection.getOutputCol()));
			String[] exp = new String[modelSelection.getFeatureCol().size()];
			int i=0;
			for (String s :modelSelection.getFeatureCol()) {
				System.out.println(s);
				exp[i] = "`"+s.trim()+"`";
				i++;
			}


			f_df = currentDf.selectExpr(exp);
		}


		for(Tuple2<String, String> tup: f_df.dtypes()){
			if(tup._1.equals(modelSelection.getOutputCol())) {
				continue;
			}

			if(tup._2 == "StringType") {
				categorical.add(tup._1);
			}
			else {
				numerical.add(tup._1);
				f_df = f_df.withColumn("_" + tup._1 , f_df.col(tup._1).cast(DataTypes.DoubleType)).drop(tup._1).withColumnRenamed("_" + tup._1, tup._1);
			}

		}



//		for(String str: categorical){
//
//			StringIndexer strIndexer = new StringIndexer().setInputCol(str).setOutputCol(str + "Index");
//			OneHotEncoder encoder = new OneHotEncoder().setInputCol(strIndexer.getOutputCol()).setOutputCol(str + "classVec");
//
//			stages.add(strIndexer);
//			stages.add(encoder);
//		}
//
//		List<String> assemblerInputs = new ArrayList<>(numerical);
//		for(String str: categorical) {
//			assemblerInputs.add(str);
//		}
		
		List<String> newCat = new ArrayList<>();
		for(String str: categorical){

			StringIndexer strIndexer = new StringIndexer().setInputCol(str).setOutputCol(str + "Index");
			OneHotEncoder encoder = new OneHotEncoder().setInputCol(strIndexer.getOutputCol()).setOutputCol(str + "classVec");

			stages.add(strIndexer);
			if (f_df.select(str).distinct().count() < 2) {
				newCat.add(str+"Index");
				continue;
			}
			else {
				newCat.add(str+"classVec");
			}
			stages.add(encoder);
		}
		
		List<String> assemblerInputs = new ArrayList<>(numerical);
		for(String str: newCat) {
			assemblerInputs.add(str);
		}
		

		//		System.out.println(categorical);
		//		System.out.println(numerical);
		VectorAssembler assembler = new VectorAssembler().setInputCols(assemblerInputs.toArray(new String[0])).setOutputCol("features");
		stages.add(assembler);

		Pipeline partialPipeline = new Pipeline().setStages(stages.toArray(new PipelineStage[0]));

		pipelineModel = partialPipeline.fit(f_df);

		Dataset<Row> preppedDataDF = pipelineModel.transform(f_df);

		System.out.println(modelSelection.getTestSplit()/100.0);

		System.out.println(modelSelection.getTrainSplit()/100.0);

		Dataset<Row>[] ds = preppedDataDF.randomSplit(new double[] {modelSelection.getTrainSplit()/100.0, modelSelection.getTestSplit()/100.0});

		training = ds[0];
		testing = ds[1];

		preppedDataDF.show();
		return f_df;
	}


	@RequestMapping(value="prepare-model",  method = RequestMethod.POST, produces =MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<JSONObject> prepareModel(@RequestBody ModelSelection modelSelection){

		System.out.println("ModelData "+modelSelection);

		resetModel();


		JSONObject res = new JSONObject();
		Dataset<Row> f_df = null;
		if (modelSelection.getModel().equals("classification")) {
			f_df  = prepareClassficationModel(modelSelection);
		}

		if (modelSelection.getModel().equals("regression")) {
			f_df  = prepareRegressionModel(modelSelection);
		}
		if (modelSelection.getModel().equals("clustering")) {
			f_df  = prepareClusteringModel(modelSelection);
		}


		List<Row> training_json = training.limit(limit).collectAsList();
		JSONObject training_set = Utils.convertFrameToJson2Cols(training_json, f_df.columns());
		List<Row> testing_json = testing.limit(limit).collectAsList();
		JSONObject testing_set = Utils.convertFrameToJson2Cols(testing_json, f_df.columns());
		res.put("training_set", training_set);
		res.put("testing_set", testing_set);
		Tuple2<String, String>[] dtypes = f_df.dtypes();
		JSONArray header = Utils.getTypes(dtypes);
		res.put("header", header);
		return new ResponseEntity<>(res, HttpStatus.OK);

	}

	private Dataset<Row> prepareRegressionModel(ModelSelection modelSelection) {
		// TODO Auto-generated method stub
		Dataset<Row> f_df = currentDf;
		if (!modelSelection.getFeatureCol().get(0).equals("All")) {
			modelSelection.getFeatureCol().add((modelSelection.getOutputCol()));
			String[] exp = new String[modelSelection.getFeatureCol().size()];
			int i=0;
			for (String s :modelSelection.getFeatureCol()) {
				System.out.println(s);
				exp[i] = "`"+s.trim()+"`";
				i++;
			}


			f_df = currentDf.selectExpr(exp);
		}
		f_df = f_df.withColumn("label", f_df.col(modelSelection.getOutputCol()));
		f_df = f_df.withColumn("labelTmp", f_df.col("label").cast(DataTypes.DoubleType)).drop("label").withColumnRenamed("labelTmp", "label");
		ArrayList<PipelineStage> stages = new ArrayList<>();
		List<String> categorical = new ArrayList<>();
		List<String> numerical = new ArrayList<>();
		for(Tuple2<String, String> tup: f_df.dtypes())
		{
			if(tup._1 == "label" || tup._1 == modelSelection.getOutputCol()) {
				continue;
			}
			if(tup._2 == "StringType")
				categorical.add(tup._1);
			else 
			{
				f_df = f_df.withColumn("_" + tup._1 , f_df.col(tup._1).cast(DataTypes.DoubleType)).drop(tup._1).withColumnRenamed("_" + tup._1, tup._1);
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

		pipelineModel = partialPipeline.fit(f_df);

		Dataset<Row> preppedDataDF = pipelineModel.transform(f_df);
		System.out.println(modelSelection.getTestSplit()/100.0);
		System.out.println(modelSelection.getTrainSplit()/100.0);
		Dataset<Row>[] ds = preppedDataDF.randomSplit(new double[] {modelSelection.getTrainSplit()/100.0, modelSelection.getTestSplit()/100.0});

		training = ds[0];
		testing = ds[1];

		preppedDataDF.show();
		return f_df;
	}


	@RequestMapping(value="update-missing")
	public ResponseEntity<JSONObject> updateMissingValues(@RequestBody MissingData missingData){

		if (!missingData.getOldColumnName().equals(missingData.getNewColumnName())) {
			System.out.println("Updating column $$$$$$$$");
			masterDf = masterDf.withColumnRenamed(missingData.getOldColumnName(), missingData.getNewColumnName());
			currentDf = currentDf.withColumnRenamed(missingData.getOldColumnName(), missingData.getNewColumnName());

		}

		if (missingData.getValue().trim().length()!=0) {
			System.out.println("Updating value $$$$$$$");
			String[] c = new String[1];
			c[0] = missingData.getNewColumnName();

			String type = Utils.getColumnType(masterDf.dtypes(), missingData.getNewColumnName());
			System.out.println("TYpe $$$$$$$ " + type);
			switch (type) {
			case "DoubleType":
				masterDf = masterDf.na().fill(Double.valueOf(missingData.getValue()) ,c);
				currentDf = currentDf.na().fill(Double.valueOf(missingData.getValue()) ,c);
				break;

			case "StringType":
				masterDf = masterDf.na().fill(missingData.getValue() ,c);
				currentDf = currentDf.na().fill(missingData.getValue() ,c);
				break;


			case "LongType":
				masterDf = masterDf.na().fill(Long.valueOf(missingData.getValue()) ,c);
				currentDf = currentDf.na().fill(Long.valueOf(missingData.getValue()) ,c);
				break;

			default:
				break;
			}


		}

		Map<FramePojo, Dataset<Row>> frameData = masterFrames.get(master_frame_id);

		FramePojo tempFPojo = null;

		for (FramePojo fPojo : frameData.keySet()) {
			tempFPojo = fPojo;

		}

		frameData.put(tempFPojo, masterDf);



		JSONObject js = Utils.convertFrameToJson2(currentDf.collectAsList());
		//		System.out.println(js);

		Tuple2<String, String>[] dtypes = currentDf.dtypes();

		JSONArray header = Utils.getTypes(dtypes);

		js.put("header", header);

		return new ResponseEntity<>(js, HttpStatus.OK);

	}

	@RequestMapping(value="predict")
	public ResponseEntity<JSONObject> predict(@RequestBody Map<String, Object> modelJson){

		System.out.println(modelJson);

		LogisticRegressionModel lrModel = null;
		DecisionTreeClassificationModel dtModel= null;
		NaiveBayesModel nbModel= null;
		RandomForestClassificationModel rfModel = null;
		GBTClassificationModel gbtModel = null;
		LinearRegressionModel linearRegModel = null;
		DecisionTreeRegressionModel dtRegModel = null;
		RandomForestRegressionModel rfRegModel = null;

		String outputCol = (String) modelJson.get("outputCol");
		String model_type = (String) modelJson.get("model");

		List<Map<String, Object>> it = (List<Map<String, Object>>) modelJson.get("data");

		JSONObject res = new JSONObject();

		for (Map<String, Object> model :  it) {



			if (model.get("model").equals("logistic_regression") && model_type.equals("classification")){

				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();

				JSONObject hyper_tuning = new JSONObject();

				if (model.get("hyper_params")!=null) {

					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");

					LR lrPojo = new LR();
					lrPojo.setElasticNetParam(hyperParams.get("elasticNetParam"));
					lrPojo.setMaxIter(hyperParams.get("maxIter"));
					lrPojo.setRegParam(hyperParams.get("regParam"));
					lrPojo.setTol(hyperParams.get("tol"));

					System.out.println("LR POJO -> "+lrPojo);
					MulticlassClassificationEvaluator mce = new MulticlassClassificationEvaluator().setPredictionCol("prediction").setLabelCol("label");
					mce.setMetricName((String) model.get("metric"));
					LogisticRegression lr = new LogisticRegression();
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(lr.elasticNetParam(), lrPojo.getElasticNetParam()).addGrid(lr.regParam(), lrPojo.getRegParam()).addGrid(lr.maxIter(), lrPojo.getMaxIter()).addGrid(lr.tol(), lrPojo.getTol());
					ParamMap[] pMap = paramGrid.build();
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(lr).setEstimatorParamMaps(pMap).setEvaluator(mce);
					CrossValidatorModel cvm = cv.fit(training);
					//System.out.println("explains param "+cvm.explainParams());
					System.out.println("best model params "+cvm.bestModel().explainParams());
					String bestParams = cvm.bestModel().explainParams();
					best_params = Utils.parseBestParam(hyperParams, bestParams);

					predictions = cvm.transform(testing);


					double best_metric_training = 0.0;

					for(double d : cvm.avgMetrics()) {
						if (d > best_metric_training) {
							best_metric_training = d;
						}
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_testing =mce.evaluate(predictions);
					System.out.println(mce.getMetricName());
					hyper_tuning.put("best_metric_training", best_metric_training);
					hyper_tuning.put("best_metric_testing", best_metric_testing);
					hyper_tuning.put("metric", mce.getMetricName());
				}
				else {
					lrModel = new LogisticRegression().fit(training);
					predictions = lrModel.transform(testing);
				}



				predictions.show();


				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select("prediction", "label"));
				double[] cm = metrics.confusionMatrix().toArray();
				double sum = cm[0] + cm[1] + cm[2] + cm[3];
				double acc=(cm[0]+cm[3])/sum;
				double precision=(cm[0])/(cm[0]+cm[1]);
				double recall=(cm[0])/(cm[0]+cm[2]);
				double fMeasure = (2*(precision*recall))/(precision+recall);


				Dataset<Row> p_orginal = predictions.select("prediction-original").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());

				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", df2.format(acc));
				temp_res.put("fMeasure", df2.format(fMeasure));
				temp_res.put("precision", df2.format(precision));
				temp_res.put("recall", df2.format(recall));
				temp_res.put("best_params", best_params);
				temp_res.put("hyper_tuning", hyper_tuning);



				if (model.get("hyper_params") ==null) {
					BinaryLogisticRegressionSummary bsummary = (BinaryLogisticRegressionSummary)lrModel.summary();
					bsummary.roc().show();
					System.out.println(bsummary.areaUnderROC());

					JSONObject x = Utils.convertFrameToJson2ColsRoc(bsummary.roc().collectAsList(), bsummary.roc().columns());
					temp_res.put("roc_data", x);
				}
				res.put(model.get("model"), temp_res);
			}



			if (model.get("model").equals("decision_tree") && model_type.equals("classification")){


				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();
				JSONObject hyper_tuning = new JSONObject();


				if (model.get("hyper_params")!=null) {

					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");

					DT dtPojo = new DT();
					dtPojo.setMaxBins(hyperParams.get("maxBins"));
					dtPojo.setMaxDepth(hyperParams.get("maxDepth"));
					dtPojo.setMinInfoGain(hyperParams.get("minInfoGain"));
					dtPojo.setMinInstancesperNode(hyperParams.get("minInstancesperNode"));

					System.out.println("DT POJO -> "+dtPojo);
					MulticlassClassificationEvaluator mce = new MulticlassClassificationEvaluator().setPredictionCol("prediction").setLabelCol("label");
					mce.setMetricName((String) model.get("metric"));
					DecisionTreeClassifier dt = new DecisionTreeClassifier();
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(dt.maxBins(), dtPojo.getMaxBins()).addGrid(dt.maxDepth(), dtPojo.getMaxDepth()).addGrid(dt.minInfoGain(), dtPojo.getMinInfoGain()).addGrid(dt.minInstancesPerNode(), dtPojo.getMinInstancesperNode());
					ParamMap[] pMap = paramGrid.build();
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(dt).setEstimatorParamMaps(pMap).setEvaluator(mce);
					CrossValidatorModel cvm = cv.fit(training);
					//System.out.println("explains param "+cvm.explainParams());
					System.out.println("best model params "+cvm.bestModel().explainParams());
					String bestParams = cvm.bestModel().explainParams();
					best_params = Utils.parseBestParam(hyperParams, bestParams);
					predictions = cvm.transform(testing);
					double best_metric_training = 0.0;

					for(double d : cvm.avgMetrics()) {
						if (d > best_metric_training) {
							best_metric_training = d;
						}
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_testing =mce.evaluate(predictions);
					System.out.println(mce.getMetricName());
					hyper_tuning.put("best_metric_training", best_metric_training);
					hyper_tuning.put("best_metric_testing", best_metric_testing);
					hyper_tuning.put("metric", mce.getMetricName());
				}
				else {
					dtModel = new DecisionTreeClassifier().fit(training);
					predictions = dtModel.transform(testing);
				}




				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select("prediction", "label"));
				double[] cm = metrics.confusionMatrix().toArray();
				double sum = cm[0] + cm[1] + cm[2] + cm[3];
				double acc=(cm[0]+cm[3])/sum;
				double precision=(cm[0])/(cm[0]+cm[1]);
				double recall=(cm[0])/(cm[0]+cm[2]);
				double fMeasure = (2*(precision*recall))/(precision+recall);


				Dataset<Row> p_orginal = predictions.select("prediction-original").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());


				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", df2.format(acc));
				temp_res.put("fMeasure", df2.format(fMeasure));
				temp_res.put("precision", df2.format(precision));
				temp_res.put("recall", df2.format(recall));
				temp_res.put("best_params", best_params);
				temp_res.put("hyper_tuning", hyper_tuning);

				res.put(model.get("model"), temp_res);


			}
			if (model.get("model").equals("naive_bayes") && model_type.equals("classification")){

				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();
				JSONObject hyper_tuning = new JSONObject();

				if (model.get("hyper_params")!=null) {

					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");

					NB nbPojo = new NB();
					nbPojo.setSmoothing(hyperParams.get("smoothing"));

					System.out.println("NB POJO -> "+nbPojo);
					MulticlassClassificationEvaluator mce = new MulticlassClassificationEvaluator().setPredictionCol("prediction").setLabelCol("label");
					mce.setMetricName((String) model.get("metric"));
					NaiveBayes nb = new NaiveBayes();
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(nb.smoothing(),nbPojo.getSmoothing());
					ParamMap[] pMap = paramGrid.build();
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(nb).setEstimatorParamMaps(pMap).setEvaluator(mce);
					CrossValidatorModel cvm = cv.fit(training);
					//System.out.println("explains param "+cvm.explainParams());
					System.out.println("best model params "+cvm.bestModel().explainParams());
					String bestParams = cvm.bestModel().explainParams();
					best_params = Utils.parseBestParam(hyperParams, bestParams);
					predictions = cvm.transform(testing);
					double best_metric_training = 0.0;

					for(double d : cvm.avgMetrics()) {
						if (d > best_metric_training) {
							best_metric_training = d;
						}
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_testing =mce.evaluate(predictions);
					System.out.println(mce.getMetricName());
					hyper_tuning.put("best_metric_training", best_metric_training);
					hyper_tuning.put("best_metric_testing", best_metric_testing);
					hyper_tuning.put("metric", mce.getMetricName());
				}
				else {
					nbModel = new NaiveBayes().fit(training);
					predictions = nbModel.transform(testing);
				}

				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select("prediction", "label"));
				double[] cm = metrics.confusionMatrix().toArray();
				double sum = cm[0] + cm[1] + cm[2] + cm[3];
				double acc=(cm[0]+cm[3])/sum;
				double precision=(cm[0])/(cm[0]+cm[1]);
				double recall=(cm[0])/(cm[0]+cm[2]);
				double fMeasure = (2*(precision*recall))/(precision+recall);


				Dataset<Row> p_orginal = predictions.select("prediction-original").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());


				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", df2.format(acc));
				temp_res.put("fMeasure", df2.format(fMeasure));
				temp_res.put("precision", df2.format(precision));
				temp_res.put("recall", df2.format(recall));
				temp_res.put("best_params", best_params);
				temp_res.put("hyper_tuning", hyper_tuning);
				res.put(model.get("model"), temp_res);



			}

			if (model.get("model").equals("random_forests") && model_type.equals("classification")){


				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();
				JSONObject hyper_tuning = new JSONObject();

				if (model.get("hyper_params")!=null) {

					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");

					RF rfPojo = new RF();
					rfPojo.setMaxBins(hyperParams.get("maxBins"));
					rfPojo.setMaxDepth(hyperParams.get("maxDepth"));
					rfPojo.setMinInfoGain(hyperParams.get("minInfoGain"));
					rfPojo.setNumTrees(hyperParams.get("numTrees"));

					System.out.println("RF"+rfPojo);
					MulticlassClassificationEvaluator mce = new MulticlassClassificationEvaluator().setPredictionCol("prediction").setLabelCol("label");
					mce.setMetricName((String) model.get("metric"));
					RandomForestClassifier rf = new RandomForestClassifier();
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(rf.maxBins(), rfPojo.getMaxBins()).addGrid(rf.maxDepth(), rfPojo.getMaxDepth()).addGrid(rf.minInfoGain(), rfPojo.getMinInfoGain()).addGrid(rf.numTrees(), rfPojo.getNumTrees());
					ParamMap[] pMap = paramGrid.build();
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(rf).setEstimatorParamMaps(pMap).setEvaluator(mce);
					CrossValidatorModel cvm = cv.fit(training);
					//System.out.println("explains param "+cvm.explainParams());
					System.out.println("best model params "+cvm.bestModel().explainParams());
					String bestParams = cvm.bestModel().explainParams();
					best_params = Utils.parseBestParam(hyperParams, bestParams);
					predictions = cvm.transform(testing);
					double best_metric_training = 0.0;

					for(double d : cvm.avgMetrics()) {
						if (d > best_metric_training) {
							best_metric_training = d;
						}
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_testing =mce.evaluate(predictions);
					System.out.println(mce.getMetricName());
					hyper_tuning.put("best_metric_training", best_metric_training);
					hyper_tuning.put("best_metric_testing", best_metric_testing);
					hyper_tuning.put("metric", mce.getMetricName());
				}
				else {
					rfModel = new RandomForestClassifier().fit(training);
					predictions = rfModel.transform(testing);
				}
				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select("prediction", "label"));
				double[] cm = metrics.confusionMatrix().toArray();
				double sum = cm[0] + cm[1] + cm[2] + cm[3];
				double acc=(cm[0]+cm[3])/sum;
				double precision=(cm[0])/(cm[0]+cm[1]);
				double recall=(cm[0])/(cm[0]+cm[2]);
				double fMeasure = (2*(precision*recall))/(precision+recall);


				Dataset<Row> p_orginal = predictions.select("prediction-original").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());

				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", df2.format(acc));
				temp_res.put("fMeasure", df2.format(fMeasure));
				temp_res.put("precision", df2.format(precision));
				temp_res.put("recall", df2.format(recall));
				temp_res.put("best_params", "");
				temp_res.put("hyper_tuning", hyper_tuning);

				res.put(model.get("model"), temp_res);
			}

			if (model.get("model").equals("gradient_boosted_trees") && model_type.equals("classification")){
				gbtModel = new GBTClassifier().fit(training);
				Dataset<Row> predictions = gbtModel.transform(testing);
				predictions.show();

				Transformer[] _stages = pipelineModel.stages();

				StringIndexerModel temp = (StringIndexerModel)_stages[0];


				IndexToString trs = new IndexToString().setLabels(temp.labels()).setInputCol("prediction").setOutputCol("prediction-original");
				predictions = trs.transform(predictions);


				System.out.println("-----<>-----"+model.get("model"));
				predictions.show();

				MulticlassMetrics metrics = new MulticlassMetrics(predictions.select("prediction", "label"));
				double[] cm = metrics.confusionMatrix().toArray();
				double sum = cm[0] + cm[1] + cm[2] + cm[3];
				double acc=(cm[0]+cm[3])/sum;
				double precision=(cm[0])/(cm[0]+cm[1]);
				double recall=(cm[0])/(cm[0]+cm[2]);
				double fMeasure = (2*(precision*recall))/(precision+recall);


				Dataset<Row> p_orginal = predictions.select("prediction-original").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());


				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("accuracy", df2.format(acc));
				temp_res.put("fMeasure", df2.format(fMeasure));
				temp_res.put("precision", df2.format(precision));
				temp_res.put("recall", df2.format(recall));
				temp_res.put("best_params", "");
				res.put(model.get("model"), temp_res);

			}

			if (model.get("model").equals("linear_regression") && model_type.equals("regression")){

				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();

				JSONObject hyper_tuning = new JSONObject();

				if (model.get("hyper_params")!=null) {

					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");

					LinearR linearRPojo = new LinearR();
					linearRPojo.setElasticNetParam(hyperParams.get("elasticNetParam"));
					linearRPojo.setMaxIter(hyperParams.get("maxIter"));
					linearRPojo.setTol(hyperParams.get("tol"));

					System.out.println("linearRPojo POJO -> "+linearRPojo);
					RegressionEvaluator mce = new RegressionEvaluator().setPredictionCol("prediction").setLabelCol("label");
					mce.setMetricName((String) model.get("metric"));
					LinearRegression linearRegression = new LinearRegression();
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(linearRegression.elasticNetParam(), linearRPojo.getElasticNetParam()).addGrid(linearRegression.maxIter(), linearRPojo.getMaxIter()).addGrid(linearRegression.tol(), linearRPojo.getTol());
					ParamMap[] pMap = paramGrid.build();
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(linearRegression).setEstimatorParamMaps(pMap).setEvaluator(mce);
					CrossValidatorModel cvm = cv.fit(training);
					//System.out.println("explains param "+cvm.explainParams());
					System.out.println("best model params "+cvm.bestModel().explainParams());
					String bestParams = cvm.bestModel().explainParams();
					best_params = Utils.parseBestParam(hyperParams, bestParams);
					predictions = cvm.transform(testing);
					for(double d : cvm.avgMetrics()) {
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_training = 0.0;

					for(double d : cvm.avgMetrics()) {
						if (d > best_metric_training) {
							best_metric_training = d;
						}
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_testing =mce.evaluate(predictions);
					System.out.println(mce.getMetricName());
					hyper_tuning.put("best_metric_training", best_metric_training);
					hyper_tuning.put("best_metric_testing", best_metric_testing);
					hyper_tuning.put("metric", mce.getMetricName());
				}
				else {
					linearRegModel = new LinearRegression().fit(training);
					predictions = linearRegModel.transform(testing);
				}

				predictions.show();
				RegressionMetrics metrics = new RegressionMetrics(predictions.select("label", "prediction"));
				System.out.println("-----<>-----"+model.get("model"));



				Dataset<Row> p_orginal = predictions.select("prediction").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());


				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("mse", df2.format(metrics.meanSquaredError()));
				temp_res.put("mae", df2.format(metrics.meanAbsoluteError()));
				temp_res.put("rmse", df2.format(metrics.rootMeanSquaredError()));
				temp_res.put("r2", df2.format(metrics.r2()));
				temp_res.put("hyper_tuning", hyper_tuning);
				temp_res.put("best_params", "");
				res.put(model.get("model"), temp_res);

			}


			if (model.get("model").equals("decision_tree") && model_type.equals("regression")){

				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();

				JSONObject hyper_tuning = new JSONObject();

				if (model.get("hyper_params")!=null) {

					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");
					DT dtPojo = new DT();
					dtPojo.setMaxBins(hyperParams.get("maxBins"));
					dtPojo.setMaxDepth(hyperParams.get("maxDepth"));
					dtPojo.setMinInfoGain(hyperParams.get("minInfoGain"));
					dtPojo.setMinInstancesperNode(hyperParams.get("minInstancesperNode"));

					System.out.println("DT POJO -> "+dtPojo);
					RegressionEvaluator mce = new RegressionEvaluator().setPredictionCol("prediction").setLabelCol("label");
					mce.setMetricName((String) model.get("metric"));
					DecisionTreeRegressor dt = new DecisionTreeRegressor();
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(dt.maxBins(), dtPojo.getMaxBins()).addGrid(dt.maxDepth(), dtPojo.getMaxDepth()).addGrid(dt.minInfoGain(), dtPojo.getMinInfoGain()).addGrid(dt.minInstancesPerNode(), dtPojo.getMinInstancesperNode());
					ParamMap[] pMap = paramGrid.build();
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(dt).setEstimatorParamMaps(pMap).setEvaluator(mce);
					CrossValidatorModel cvm = cv.fit(training);
					//System.out.println("explains param "+cvm.explainParams());
					System.out.println("best model params "+cvm.bestModel().explainParams());
					String bestParams = cvm.bestModel().explainParams();
					best_params = Utils.parseBestParam(hyperParams, bestParams);
					predictions = cvm.transform(testing);
					for(double d : cvm.avgMetrics()) {
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_training = 0.0;

					for(double d : cvm.avgMetrics()) {
						if (d > best_metric_training) {
							best_metric_training = d;
						}
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_testing =mce.evaluate(predictions);
					System.out.println(mce.getMetricName());
					hyper_tuning.put("best_metric_training", best_metric_training);
					hyper_tuning.put("best_metric_testing", best_metric_testing);
					hyper_tuning.put("metric", mce.getMetricName());
				}
				else {
					dtRegModel = new DecisionTreeRegressor().fit(training);
					predictions = dtRegModel.transform(testing);
				}

				predictions.show();
				RegressionMetrics metrics = new RegressionMetrics(predictions.select("label", "prediction"));
				System.out.println("-----<>-----"+model.get("model"));



				Dataset<Row> p_orginal = predictions.select("prediction").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());


				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("mse", df2.format(metrics.meanSquaredError()));
				temp_res.put("mae", df2.format(metrics.meanAbsoluteError()));
				temp_res.put("rmse", df2.format(metrics.rootMeanSquaredError()));
				temp_res.put("r2", df2.format(metrics.r2()));
				temp_res.put("hyper_tuning", hyper_tuning);
				temp_res.put("best_params", "");
				res.put(model.get("model"), temp_res);

			}


			if (model.get("model").equals("random_forests") && model_type.equals("regression")){

				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();

				JSONObject hyper_tuning = new JSONObject();

				if (model.get("hyper_params")!=null) {

					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");

					RF rfPojo = new RF();
					rfPojo.setMaxBins(hyperParams.get("maxBins"));
					rfPojo.setMaxDepth(hyperParams.get("maxDepth"));
					rfPojo.setMinInfoGain(hyperParams.get("minInfoGain"));
					rfPojo.setNumTrees(hyperParams.get("numTrees"));

					System.out.println("RF"+rfPojo);
					RegressionEvaluator mce = new RegressionEvaluator().setPredictionCol("prediction").setLabelCol("label");
					mce.setMetricName((String) model.get("metric"));
					RandomForestRegressor rf = new RandomForestRegressor();
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(rf.maxBins(), rfPojo.getMaxBins()).addGrid(rf.maxDepth(), rfPojo.getMaxDepth()).addGrid(rf.minInfoGain(), rfPojo.getMinInfoGain()).addGrid(rf.numTrees(), rfPojo.getNumTrees());
					ParamMap[] pMap = paramGrid.build();
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(rf).setEstimatorParamMaps(pMap).setEvaluator(mce);
					CrossValidatorModel cvm = cv.fit(training);
					//System.out.println("explains param "+cvm.explainParams());
					System.out.println("best model params "+cvm.bestModel().explainParams());
					String bestParams = cvm.bestModel().explainParams();
					best_params = Utils.parseBestParam(hyperParams, bestParams);
					predictions = cvm.transform(testing);
					for(double d : cvm.avgMetrics()) {
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					System.out.println(mce.evaluate(predictions));
					double best_metric_training = 0.0;

					for(double d : cvm.avgMetrics()) {
						if (d > best_metric_training) {
							best_metric_training = d;
						}
						System.out.println("mteric "+d);
					}
					System.out.println(mce.evaluate(predictions));
					double best_metric_testing =mce.evaluate(predictions);
					System.out.println(mce.getMetricName());
					hyper_tuning.put("best_metric_training", best_metric_training);
					hyper_tuning.put("best_metric_testing", best_metric_testing);
					hyper_tuning.put("metric", mce.getMetricName());
				}
				else {
					rfRegModel = new RandomForestRegressor().fit(training);
					predictions = rfRegModel.transform(testing);
				}

				predictions.show();
				RegressionMetrics metrics = new RegressionMetrics(predictions.select("label", "prediction"));
				System.out.println("-----<>-----"+model.get("model"));



				Dataset<Row> p_orginal = predictions.select("prediction").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());


				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("mse", df2.format(metrics.meanSquaredError()));
				temp_res.put("mae", df2.format(metrics.meanAbsoluteError()));
				temp_res.put("rmse", df2.format(metrics.rootMeanSquaredError()));
				temp_res.put("r2", df2.format(metrics.r2()));
				temp_res.put("hyper_tuning", hyper_tuning);
				temp_res.put("best_params", "");
				res.put(model.get("model"), temp_res);

			}

			if (model.get("model").equals("kmeans") && model_type.equals("clustering")){
				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();

				JSONObject hyper_tuning = new JSONObject();
				KMeansModel kmModel= null;
				ClusteringEvaluator ce = new ClusteringEvaluator();
				if (model.get("hyper_params")!=null) {
					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");
					KMeans km = new KMeans();
					KMPojo kPojo = new KMPojo();
					kPojo.setK(hyperParams.get("k"));
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(km.k(), kPojo.getK());
					ParamMap[] pMap = paramGrid.build();
					
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(km).setEstimatorParamMaps(pMap).setEvaluator(ce);
					CrossValidatorModel cvm = cv.fit(training);
					predictions = cvm.transform(testing);
					kmModel = (KMeansModel)cvm.bestModel();
					best_params.put("k", kmModel.getK());
				}
				else {
					KMeans km = new KMeans().setK((int) model.get("k"));
					kmModel = km.fit(training);
					predictions = kmModel.transform(testing);
				}
				KMeansSummary summary = kmModel.summary();
				long[] clusterSizes = summary.clusterSizes();
				System.out.println("Cluster Sizes "+clusterSizes);
				double silhoute_score = ce.evaluate(predictions);
				System.out.println("silhoute_score "+silhoute_score);
				for(Vector v: kmModel.clusterCenters()){
					System.out.println(v);
				}
				Dataset<Row> p_orginal = predictions.select("prediction").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());
				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("best_params", best_params);
				temp_res.put("silhoute_score", silhoute_score);
				temp_res.put("clusterSizes", clusterSizes);
				res.put(model.get("model"), temp_res);
				
			}
			
			if (model.get("model").equals("bisecting_kmeans") && model_type.equals("clustering")){
				Dataset<Row> predictions = null;

				JSONObject best_params = new JSONObject();

				JSONObject hyper_tuning = new JSONObject();
				BisectingKMeansModel bisectingKModel = null;
				ClusteringEvaluator ce = new ClusteringEvaluator();
				if (model.get("hyper_params")!=null) {
					Map<String, String> hyperParams = (Map<String, String>) model.get("hyper_params");
					BisectingKMeans bisectingKmeans = new BisectingKMeans();
					BisectingKMPojo kPojo = new BisectingKMPojo();
					kPojo.setK(hyperParams.get("k"));
					kPojo.setMaxIter(hyperParams.get("maxIter"));
					kPojo.setMinDivisibleClusterSize(hyperParams.get("minDivisibleClusterSize"));
					ParamGridBuilder paramGrid = new ParamGridBuilder().addGrid(bisectingKmeans.k(), kPojo.getK()).addGrid(bisectingKmeans.maxIter(), kPojo.getMaxIter()).addGrid(bisectingKmeans.minDivisibleClusterSize(), kPojo.getMinDivisibleClusterSize());
					ParamMap[] pMap = paramGrid.build();
					
					CrossValidator cv = new CrossValidator().setNumFolds(Integer.valueOf(String.valueOf(model.get("kfold")))).setEstimator(bisectingKmeans).setEstimatorParamMaps(pMap).setEvaluator(ce);
					CrossValidatorModel cvm = cv.fit(training);
					predictions = cvm.transform(testing);
					bisectingKModel = (BisectingKMeansModel)cvm.bestModel();
					best_params.put("k", bisectingKModel.getK());
					best_params.put("maxIter", bisectingKModel.getMaxIter());
					best_params.put("minDivisibleClusterSize", bisectingKModel.getMinDivisibleClusterSize());
				}
				else {
					BisectingKMeans km = new BisectingKMeans().setK((int) model.get("k"));
					bisectingKModel = km.fit(training);
					predictions = 	bisectingKModel.transform(testing);
				}
				BisectingKMeansSummary summary = bisectingKModel.summary();
				long[] clusterSizes = summary.clusterSizes();
				System.out.println("Cluster Sizes "+clusterSizes);
				double silhoute_score = ce.evaluate(predictions);
				System.out.println("silhoute_score "+silhoute_score);
				
				Dataset<Row> p_orginal = predictions.select("prediction").limit(limit);
				JSONObject p_original_json = Utils.convertFrameToJson2Single(p_orginal.collectAsList());
				JSONObject temp_res = new JSONObject();
				temp_res.put("prediction", p_original_json);
				temp_res.put("best_params", best_params);
				temp_res.put("silhoute_score", silhoute_score);
				temp_res.put("clusterSizes", clusterSizes);
				res.put(model.get("model"), temp_res);
				
			}


		}

		return new ResponseEntity<>(res, HttpStatus.OK);

	}






}
