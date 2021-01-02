import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.commons.cli.*;
import org.bson.Document;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


public class uploader {
    public static final String DBNAME = "techVault";
    public static final ImmutableList<String> COMPANIES =
            ImmutableList.of("airbnb", "aws", "babble", "confluent", "criteo", "deepmind", "ebay", "facebook", "linkedin", "medium", "netflix", "nvidia", "quora", "slack", "stackoverflow", "twilio", "uber", "yahoo", "yelp");

    private static List<String> readFileToJsonString(File file) {
        JSONParser parser = new JSONParser();
        List<String> list = new ArrayList<>();
        try {
            Object obj = parser.parse(new FileReader(file));
            JSONObject jsonObject = (JSONObject) obj;
            for(String s : COMPANIES) {
                if(jsonObject.containsKey(s)) {
                    JSONArray blogs = (JSONArray) jsonObject.get(s);
                    for (Object blog : blogs.toArray()) {
                        JSONObject jsonObj = (JSONObject) blog;
                        jsonObj.put("company", s);
                        final String uuid = UUID.randomUUID().toString().replace("-", "");
                        jsonObj.put("uuid", uuid);
                        list.add(jsonObj.toJSONString());
                    }
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }


    public static void main(String[] args) {
        Options options = new Options();
        Option directoryOption = new Option("d", "directory", true, "json file directory");
        directoryOption.setRequired(true);
        options.addOption(directoryOption);

        Option endpointOption = new Option("e", "endpoint", true, "mongoDB endpoint, e.g., mongodb+srv://<user>:<password>@cluster0.0eph1.mongodb.net/<DB name>?retryWrites=true&w=majority");
        endpointOption.setRequired(true);
        options.addOption(endpointOption);

        CommandLineParser parser = new DefaultParser();
        HelpFormatter formatter = new HelpFormatter();
        CommandLine cmd = null;

        try {
            cmd = parser.parse(options, args);
        } catch (ParseException e) {
            e.printStackTrace();
            formatter.printHelp("utility-name", options);
            System.exit(1);
        }
        Preconditions.checkNotNull(cmd);

        String directory = cmd.getOptionValue("directory");
        String endpoint = cmd.getOptionValue("endpoint");

        File folder = new File(directory);
        File[] listOfFiles = folder.listFiles();
        Preconditions.checkNotNull(listOfFiles);

        MongoClient mongoClient = MongoClients.create(endpoint);
        MongoDatabase database = mongoClient.getDatabase(DBNAME);
        MongoCollection<Document> collection = database.getCollection("blogs");

        for (File file : listOfFiles) {
            List<Document> docs = readFileToJsonString(file).stream().map(Document::parse).collect(Collectors.toList());
            collection.insertMany(docs);
        }
        mongoClient.close();
    }
}



