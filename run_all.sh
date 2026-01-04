#!/bin/bash

echo "Starting LoanFlow Ecosystem..."

# 1. Discovery Server
echo "Starting Discovery Server on port 8761..."
cd DiscoveryServer
mvn spring-boot:run &
PID_DISCOVERY=$!
cd ..
sleep 15

# 2. Auth Service
echo "Starting Auth Service on port 8080..."
cd AuthService
mvn spring-boot:run &
PID_AUTH=$!
cd ..
sleep 10

# 3. Loan Service
echo "Starting Loan Service on port 8081..."
cd LoanService
mvn spring-boot:run &
PID_LOAN=$!
cd ..
sleep 10

# 4. API Gateway
echo "Starting API Gateway on port 8082..."
cd ApiGateway
mvn spring-boot:run &
PID_GATEWAY=$!
cd ..

echo "All services started!"
echo "Discovery Server: http://localhost:8761"
echo "API Gateway: http://localhost:8082"
echo "Frontend: http://localhost:5173"

# Wait for user input to exit
read -p "Press [Enter] to stop all services..."
kill $PID_DISCOVERY $PID_AUTH $PID_LOAN $PID_GATEWAY
echo "Services stopped."
