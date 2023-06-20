const { Kafka } = require("kafkajs");
const log = require("./logger");

const KAFKA_BROKERS = process.env.KAFKA_BROKERS || "kafka:9092";
const CLient_ID = process.env.CLient_ID || "todo-app";
const kafka = new Kafka({
  clientId: CLient_ID,
  brokers: [KAFKA_BROKERS],
  connectionTimeout: 10000,
});
const producer = kafka.producer();

const admin = kafka.admin();

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
    console.log("Topic created successfully");
  } catch (error) {
    console.error(`Error creating topic: ${error}`);
  } finally {
    await admin.disconnect();
  }
};

exports.connectProducer = async () => {
  await producer.connect();
  log.info("Producer connected");
};

exports.disconnectFromKafka = async () => {
  await producer.disconnect();
  log.info("Producer disconnected");
};

exports.sendMessageToKafka = async (topic, message) => {
  try {
    await producer.connect();
    const messageValue = JSON.stringify(message); // Convert message to string
    await producer.send({
      topic: topic,
      messages: [{ value: messageValue }],
    });
    log.info(`Message sent: ${messageValue}`);
  } catch (error) {
    log.error(`Error producing message: ${error}`);
    throw error;
  } finally {
    await producer.disconnect();
  }
};
