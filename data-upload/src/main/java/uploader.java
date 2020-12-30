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
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class uploader {
    public static final String DBNAME = "techVault";
    public static final ImmutableList<String> COMPANIES =
            ImmutableList.of("Linkedin", "Yelp", "Yahoo", "Twilio", "Stack", "AWS");

    private static List<String> readFileToJsonString(File file) {
        JSONParser parser = new JSONParser();
        List<String> list = new ArrayList<>();
        try {
            Object obj = parser.parse(new FileReader(file));
            JSONObject jsonObject = (JSONObject) obj;
            JSONArray blogs = (JSONArray) jsonObject.get("Linkedin");
            for(Object blog: blogs.toArray()){
                JSONObject jsonObj = (JSONObject)blog;
                list.add(jsonObj.toJSONString());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }


    public static void main(String[] args) {
        Options options = new Options();
        Option f = new Option("f", "file", true, "input file path");
        f.setRequired(true);
        options.addOption(f);

        Option u = new Option("u", "user", true, "user name for mongodb");
        u.setRequired(true);
        options.addOption(u);

        Option p = new Option("p", "password", true, "password");
        p.setRequired(true);
        options.addOption(p);

        CommandLineParser parser = new DefaultParser();
        HelpFormatter formatter = new HelpFormatter();
        CommandLine cmd;

        try {
            cmd = parser.parse(options, args);
        } catch (ParseException e) {
            e.printStackTrace();
            formatter.printHelp("utility-name", options);
            System.exit(1);
        }
        Preconditions.checkNotNull(cmd);

        String folderName = cmd.getOptionValue("folder");
        String username = cmd.getOptionValue("user");
        String password = cmd.getOptionValue("password");

        File folder = new File(folderName);
        File[] listOfFiles = folder.listFiles();
        Preconditions.checkNotNull(listOfFiles);

        String endpoint = String.format("mongodb+srv://%s:%s@cluster0.0eph1.mongodb.net/%s?retryWrites=true&w=majority", username, password, DBNAME);
        MongoClient mongoClient = MongoClients.create(endpoint);
        MongoDatabase database = mongoClient.getDatabase(DBNAME);
        MongoCollection<Document> collection = database.getCollection("collection");

        for(File file : listOfFiles) {
            List<Document> docs = readFileToJsonString(file).stream().map(Document::parse).collect(Collectors.toList());
            collection.insertMany(docs);
        }
        mongoClient.close();
    }
}



