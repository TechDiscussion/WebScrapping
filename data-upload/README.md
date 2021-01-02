# Data uploading tool
Use this command line tool to upload json files to MongoBD server.

You can run this tool either in Intellij or in command line. 

If you are using command line, first build this tool by running`./gradlew build`. 
Find the distribution in the `build/distribution` directory, untar the compressed file and
you should fine executables in the `bin` directory.

There are two arguments in this tool. Specify json files directory by using `-d` and specify MongoDB endpoint by using `-e`.