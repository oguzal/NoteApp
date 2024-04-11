# Backend Application
## Tech Stack: TypeScript + TypeOrm + Postgres


This is the backend application, it exposes CRUD endpoints and stores the data in a database. 
Its created using Visual Studio. So its highly recommended to install it .
In terms of Database selection I didn't want to lose the benefits of RDBM so I stuck with it and Postgres is a good RDBM system, so I used it. To install it I used Docker as provides faster installation.

To connect the application to the database I used TypeORM, which significantly reduces development time of the data layer plus many other benefits

This project is created on a Windows machine but the steps to run it locally should be similar on other OS's


### To setup Docker and Postgres
1. Install Docker for Windows
1. Download bitnami/Postgressql image
1. Run ```docker run --name pg -p 5432:5432  -e POSTGRES_PASSWORD=yourpassword -d postgres```
1. Verify postgres connection with a an IDE

### To run the application

1. Update the database username and passsword in the .env file , DB_USERNAME="dbusername", DB_PASSWORD="yourpassword"
1. run ```npm i```
1. run ```npm start```
1. If you see an Error message containing "Cannot find module ... \app\" run the project in Visual Studio 
1. Verify the GET endpoint :  http://localhost:3000/notes ,  this should give the existing Notes from the database , in the initial load it will be blank screen.


