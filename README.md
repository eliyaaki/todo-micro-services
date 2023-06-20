# Todo Microservices App

This is a Todo Microservices application that consists of multiple services for managing todos, notifications, and a frontend interface. The services are connected and orchestrated using Docker Compose.

## Services

1. **Node Todo Backend Service:** This service provides the backend functionality for managing todos. It exposes APIs for creating, updating, deleting, and retrieving todos. The todo-backend service is running on port 3000.

2. **Node Notification Backend Service:** This service handles notifications related to the todos. It listens and consumes the `todo-deadline-checking` Kafka topic. It checks if the deadline of each todo has passed, and if so, it sends a notification to alert the user about the expired deadline of the todo task. The notification-backend service is running on port 3001.

3. **React Todo Frontend Service:** This service is the user-facing frontend interface for managing todos. It can be accessed at [http://localhost:5173](http://localhost:5173).

## Dependencies

The app relies on the following technologies and tools:

1. **MongoDB:** MongoDB is a popular NoSQL database used for storing and retrieving data. The Todo Microservices app utilizes MongoDB to store todos and their related information.

2. **Kafka and Zookeeper:** Kafka is a distributed streaming platform, and Zookeeper is used as the coordination service for Kafka. They are used for event-driven communication between the microservices.

## Testing

The Todo Backend Service and Notification Backend Service have been thoroughly tested using Jest, a popular JavaScript testing framework. The tests cover various scenarios and ensure the functionality and reliability of the services.
The test execution is facilitated through dedicated Dockerfiles for each service. These Dockerfiles include the necessary configurations to run the tests as part of the service startup process.
Feel free to explore the test files located in the corresponding service directories to gain further insights into the test cases and assertions.
You can also run the tests for the Todo Backend Service or the Notification Backend Service individually. To do so, navigate to the respective service directory and run the following command:

       $ npm test

## Usage

To run the Todo Microservices app locally, follow these steps:

1. Make sure you have Docker and Docker Compose installed on your machine.

2. Clone this repository.

3. Navigate to the project directory.

4. Run the following command to start the services:

  ```shell
 docker-compose up

