made:Muhammad Hashir
Justification:
Cloning repo:
Running app:
New branch created:
Implemented Functionalities without mongo DB:
● Listing:
● Adding record(With back up displayed)
● Updating record:
● Record deleted:
● Searching Records:
● Sorting:
● Export.txt:
● Vault Stats:
● Backup Folder:
Mongo DB setup:
● Made .env file
● After setting up mongo DB:
Adding:
Listing:
Updating:
Deleting:
Searching:
Sorting:
Backup:
Export.txt:
Vault stats:
Merging:
Create a new branch:
Creating dockerfile:
● Building docker file:
Pushing docker:
Docker process:
Docker hub:
Creating a network:
Volume configure:
Persistence Check:
Challenges:
Created docker-compose.yml and wrote the following code in it
version: '3.9'
.env file used as well:
Then deployed using 
docker-compose up -d
Evidence:
Improvement:
Stoping and removing both containers
Removed images:
Build compose file:
Pushing:

Setting up node 16:

Updating packages index :
sudo apt update
Installing prerequisites : sudo apt install -y curl

Download node js 16 using the following command.
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
Install Node.js 
sudo apt install -y nodejs 

Verify installation 
node -v 
npm -v 






Cloning repo:
Along Error on npm install showing node js inconsistency:


Node index.js error and curl not working:


Part 2:
Justification:
The backend application requires Express 5.1, which depends on Node.js 18 or higher. Running the app on Node 16 triggers compatibility issues. Using Node 18 inside a Docker container ensures that the application runs reliably without modifying the server’s existing Node environment (Node 16), thereby resolving environment inconsistencies.
Node.js official LTS versions: https://nodejs.org/en/about/releases/
Express 5.x release notes: https://github.com/expressjs/express/releases/tag/5.0.0

Shifting to folder:

cd ~/SCD-25-NodeApp
Making Dockerfile:
nano Dockerfile
Add the following into the dockerfile:
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm","start"]

To build docker:
docker build -t nodeapp-docker .


Running and creating container:
docker run -d -p 3000:3000 --name nodeapp-container nodeapp-docker

Checking if container is working
Docker ps -a

docker logs -f nodeapp-container

Testing backend:
curl http://localhost:3000/todo/1



Pushing to docker hub:
docker login
docker tag nodeapp-docker yourdockerhubusername/nodeapp:latest
docker push yourdockerhubusername/nodeapp:latest



Pulling and running on localhost:
docker pull yourdockerhubusername/nodeapp:latest
docker run -d -p 3000:3000 --name nodeapp nodeapp:latest





Part 3:
Cloning repo:
git clone https://github.com/LaibaImran1500/SCDProject25
cd SCDProject25



Running app:
node main.js



New branch created:
git checkout -b feature
To view branches 

git branch 


Implemented Functionalities without mongo DB:


Listing:

Adding record(With back up displayed)




Updating record:


Record deleted:


Searching Records:




Sorting:



Export.txt:

Vault Stats:

Backup Folder:






Mongo DB setup:
npm install mongodb


Made .env file 
Nano .env

Data in .env
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=nodevault

npm install dotenv


Since this method was creating issue i used docker for mongo db


After setting up mongo DB:
Adding:

Listing:

Updating:

Deleting:

Searching:


Sorting:


Backup:

Export.txt:


Vault stats:

Merging:



Part 4:
Pull mongo DB:
docker pull mongo:6.0
docker run -d --name nodevault-mongo -p 27017:27017 -v nodevault-data:/data/db mongo:6.0
Docker ps 



Create a new branch:
Git checkout -b containerization

Creating dockerfile:
nano Dockerfile
content:
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "main.js"]
Building docker file:
docker build -t nodevault-backend:latest .

docker run -it --name nodevault-app --link nodevault-mongo:mongo -p 3000:3000 -e MONGO_URI=mongodb://mongo:27017 -e DB_NAME=nodevault nodevault-backend:latest



Pushing docker:
docker login
docker tag nodevault-backend:latest hashirnabeel/nodevault-backend:latest
docker push hashirnabeel/nodevault-backend:latest





Docker ps:


Docker process:
docker exec -it nodevault-app ps aux
docker exec -it nodevault-mongo ps aux




Docker hub:
link:https://hub.docker.com/repository/docker/hashirnabeel/nodevault-backend/general



PART 5:
Creating a network:
docker network create nodevault-net

This creates a private network. Containers on this network can communicate with each other but are not exposed to the public internet unless you explicitly publish ports.

Docker network ls


Volume configure:
docker volume create nodevault-data

Creating Database:
Creating mongo-db container with and including it in volume and network
docker run -d --name nodevault-mongo --network nodevault-net -v nodevault-data:/data/db -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:6.0



Initializing database:

docker exec -it nodevault-mongo mongosh -u admin -p admin123 --authenticationDatabase admin
Inside shell
use nodevault
db.createCollection("vault")
exit
Destroying and relaunching:

Since I had to do everything from scratch we stopped and removed the backend container and made a new one using the following command
docker run -it --name nodevault-backend --network nodevault-net -p 4000:3000 -e MONGO_URI="mongodb://admin:admin123@nodevault-mongo:27017/?authSource=admin" -e DB_NAME=nodevault nodevault-backend:latest




Persistence Check:
Add record:
docker exec -it nodevault-backend node main.js

Stoping containers:
docker stop nodevault-backend nodevault-mongo

Restarting both containers:
docker start nodevault-mongo
docker start nodevault-backend

Running backend:
Docker exec -it nodevault-backend node main.js




Challenges:
Port Management:
Mapping container ports to host ports caused conflicts when multiple containers used the same port.
Environment Variables and Authentication:
MongoDB requires authentication, so the MONGO_URI had to include the correct username, password, and authSource.Misconfigured environment variables prevented the backend from connecting to the database.
Persistence and Volumes:
Without attaching a named volume (nodevault-data) to MongoDB, all data would be lost if the container was removed.
Interactive vs Detached Mode:
Running the backend container in detached mode (-d) caused it to exit immediately because the CLI expects interactive input.Running with -it keeps the container interactive but requires manual terminal handling.
Overall Complexity:
Manual deployment requires careful sequencing:


Create network


Start database with volume and environment variables


Start backend with correct network, environment variables, and ports


Troubleshooting requires checking container logs (docker logs) and container status (docker ps -a) repeatedly.


Time and Effort


It took me around 2-3 hours to complete this part 5 .
It requires a lot of effort as u need to be focused and make sure to not make mistakes because mistakes can be costly in this step.

Part 6:
Created docker-compose.yml and wrote the following code in it
version: '3.9'

services:
  backend:
    build: ./
    container_name: nodevault-backend
    ports:
      - "4000:3000"
    stdin_open: true      # enables interactive mode
    tty: true             # keeps container alive for interactive CLI
    environment:
      - MONGO_URI=mongodb://admin:admin123@mongo:27017/?authSource=admin
      - DB_NAME=nodevault
    networks:
      - nodevault-net
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    container_name: nodevault-mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=admin123
    volumes:
      - nodevault-data:/data/db
    networks:
      - nodevault-net

networks:
  nodevault-net: {}

volumes:
  nodevault-data: {}


.env file used as well:
 Deleting old containers: 
docker stop nodevault-backend nodevault-mongo
docker rm nodevault-backend nodevault-mongo
Then deployed using
 docker-compose up -d


Evidence:
To run 
docker exec -it nodevault-backend node main.js
Docker ps
And the app is running






Improvement:
Using Docker Compose, we simplified deployment by defining all services, networks, volumes, and environment variables in a single docker-compose.yml file. With one command (docker compose up -d), all containers start correctly with persistent data and proper network links. This approach eliminates manual errors, ensures reproducibility across environments, and makes scaling or updating the application much easier. Overall, deployment is faster, consistent, and easier to maintain.


Part 7:
Stoping and removing both containers
docker stop nodevalue-backend
docker stop nodevalue-mongo
docker rm nodevalue-backend
docker rm nodevalue-mongo

Removed images:
Docker rmi hashirnabeel/nodevault-backend hashirnabeel/nodeapp nodeapp-docker
Docker rmi mongo:6.0


Build compose file:
docker compose up --build -d
Docker ps



Pushing:
git remote remove origin
git remote add origin https://github.com/muhammad-hashir-19/Record_Data_Node.git
Git add .
Git commit -m “added project”
git push origin main












