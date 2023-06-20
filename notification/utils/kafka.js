const { Kafka } = require("kafkajs");
const log = require("../utils/logger");
const notificationService = require("../services/notificationService");
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || "kafka:9092";
const CLient_ID = process.env.CLient_ID || "notification-app-consumer";
const GROUP_ID = process.env.GROUP_ID || "notification-app-group";
const DEADLINE_TOPIC = process.env.DEADLINE_TOPIC || "todo-deadline-checking";
const kafka = new Kafka({
  clientId: CLient_ID,
  brokers: [KAFKA_BROKERS],
  connectionTimeout: 10000,
  retry: {
    retries: 10, // Number of connection attempts
    maxRetryTime: 5000, // Maximum time between retries in milliseconds
  },
});
const consumer = kafka.consumer({ groupId: GROUP_ID });

const admin = kafka.admin();

const topics = [DEADLINE_TOPIC];

exports.createTopic = async (topicName) => {
  try {
    await admin.connect();
    await admin.createTopics({
      topics: [
        {
          topic: topicName,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
    log.info("Topic created successfully");
  } catch (error) {
    log.error(`Error creating topic: ${error}`);
  } finally {
    await admin.disconnect();
  }
};

const processTodoFromKafka = async (message) => {
  try {
    const messageValue = message.toString();
    const todo = JSON.parse(messageValue); // Parse message value as JSON
    notificationService.checkDeadlineExpiration(todo);
  } catch (error) {
    throw new Error(`Failed to processTodoFromKafka, the error was: ${error}`);
  }
};

async function messageDeadlineVerificationHandler(data) {
  await processTodoFromKafka(data);
}
//every topic has its on handler method
const topicToSubscribe = {
  [DEADLINE_TOPIC]: messageDeadlineVerificationHandler,
};
exports.connectConsumer = async () => {
  await consumer.connect();
  log.info("Connected to consumer");

  for (let i = 0; i < topics.length; i++) {
    await consumer.subscribe({
      topic: topics[i],
      fromBeginning: true,
    });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message || !message.value) {
        return;
      }

      log.info(`Consumer received message: ${message.value}`);

      const handler = topicToSubscribe[topic];
      if (handler) {
        await handler(message.value);
      }
    },
  });
};

exports.disconnectConsumer = async () => {
  await consumer.disconnect();
  log.error("Disconnected from consumer");
};
