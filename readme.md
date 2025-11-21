NodeVault – Record Manager (Node.js + MongoDB + Docker)

NodeVault is a simple CLI-based record management system built with Node.js and MongoDB, fully containerized using Docker Compose.

🚀 Run the Project
Start Services
docker compose up --build -d

Open the App (Interactive CLI)
docker exec -it nodevault-backend node main.js

📂 Features

Add, list, update, delete records

Search and case-insensitive sorting

Export records

View statistics

Persistent MongoDB storage using Docker volumes

🛢 Technologies

Node.js

MongoDB (Docker container)

Docker & Docker Compose

📸 Required Screenshots

docker images (clean environment)

Successful docker compose up --build -d

docker ps (both containers running)

App running inside container (add/list records)

📌 Notes

Exiting the CLI does not stop the container.

Data persists due to the nodevault-data volum
