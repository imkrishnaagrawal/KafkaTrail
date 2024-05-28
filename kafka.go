package main

import (
	"context"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type PartitionMeta struct {
	High  int64 `json:"high"`
	Low   int64 `json:"low"`
	Count int64 `json:"count"`
}
type TopicMeta struct {
	MessageCount   int64           `json:"message_count"`
	PartitionCount int             `json:"partition_count"`
	Partitions     []PartitionMeta `json:"partitions"`
}

type KafkaMessage struct {
	Topic     string      `json:"topic"`
	Offset    int64       `json:"offset"`
	Value     string      `json:"value"`
	Key       string      `json:"key"`
	Timestamp int64       `json:"timestamp"`
	Partition int32       `json:"partition"`
	Headers   []HeaderArg `json:"headers"`
	Size      int64       `json:"size"`
}

type TopicData struct {
	Metadata TopicMeta      `json:"metadata"`
	Messages []KafkaMessage `json:"messages"`
}

type KafkaConfig struct {
	ConnectionName   string `json:"connectionName,omitempty"`
	BootstrapServers string `json:"bootstrapServers"`
	GroupID          string `json:"groupId"`
	AutoOffsetReset  string `json:"autoOffsetReset"`
	Protocol         string `json:"protocol"`
	SaslMechanism    string `json:"saslMechanism,omitempty"`
	SaslUsername     string `json:"saslUsername,omitempty"`
	SaslPassword     string `json:"saslPassword,omitempty"`
	LastUsed         string `json:"lastUsed,omitempty"`
	IsTestConnection bool   `json:"isTestConnection,omitempty"`
}

type HeaderArg struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type ProducerMessage struct {
	Topic   string      `json:"topic"`
	Key     string      `json:"key,omitempty"`
	Value   string      `json:"value"`
	Headers []HeaderArg `json:"headers,omitempty"`
}

type KafkaService struct {
}

func NewKafkaService() *KafkaService {
	return &KafkaService{}
}

func (k *KafkaService) ValidateConnection(config KafkaConfig) (string, error) {
	_, err := createConsumer(config)
	if err != nil {
		return "", err
	}
	return "Connection Validated", nil
}

func (k *KafkaService) FetchTopics(config KafkaConfig) ([]string, error) {
	consumer, err := createConsumer(config)
	if err != nil {
		return nil, err
	}
	defer consumer.Close()

	metadata, err := consumer.GetMetadata(nil, true, 5000)
	if err != nil {
		return nil, err
	}

	topics := make([]string, 0)
	for _, topic := range metadata.Topics {
		topics = append(topics, topic.Topic)
	}

	return topics, nil
}

func (k *KafkaService) ProduceMessage(config KafkaConfig, message ProducerMessage) (string, error) {
	producer, err := createProducer(config)
	if err != nil {
		return "", err
	}
	defer producer.Close()

	headers := make([]kafka.Header, len(message.Headers))
	for i, h := range message.Headers {
		headers[i] = kafka.Header{Key: h.Key, Value: []byte(h.Value)}
	}

	msg := &kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &message.Topic, Partition: kafka.PartitionAny},
		Key:            []byte(message.Key),
		Value:          []byte(message.Value),
		Headers:        headers,
	}

	err = producer.Produce(msg, nil)
	if err != nil {
		return "", err
	}

	producer.Flush(5 * 1000)

	return "Message produced", nil
}

func (k *KafkaService) FetchMeta(config KafkaConfig, topic string, partition int32, count int64, offsetLatest bool) (*TopicMeta, error) {
	consumer, err := createConsumer(config)
	if err != nil {
		return nil, err
	}
	defer consumer.Close()

	meta, _ := consumer.GetMetadata(&topic, false, 5000)

	partitions := len(meta.Topics[topic].Partitions)

	totalMessage := 0
	partitionMessages := make([]PartitionMeta, 0)
	for partition := 0; partition < partitions; partition++ {
		low, high, err := consumer.QueryWatermarkOffsets(topic, int32(partition), 5000)
		if err != nil {
			return nil, err
		}

		totalMessagesInPartation := high - low
		partitionMessages = append(partitionMessages, PartitionMeta{high, low, totalMessagesInPartation})
		totalMessage += int(totalMessagesInPartation)
		count = count / int64(partitions)
		if count == 0 {
			count = totalMessagesInPartation
		}

		if count > totalMessagesInPartation {
			count = totalMessagesInPartation
		}

	}

	return &TopicMeta{
		MessageCount:   int64(totalMessage),
		PartitionCount: partitions,
		Partitions:     partitionMessages,
	}, nil

}

func (k *KafkaService) FetchMessages(config KafkaConfig, topic string, partition int32, count int64, offsetLatest bool) (*TopicData, error) {
	consumer, err := createConsumer(config)
	if err != nil {
		return nil, err
	}
	defer consumer.Close()
	topicMeta, _ := k.FetchMeta(config, topic, partition, count, offsetLatest)

	var messages []KafkaMessage

	for partition := 0; partition < len(topicMeta.Partitions); partition++ {

		count = count / int64(len(topicMeta.Partitions))
		if count == 0 {
			count = topicMeta.Partitions[partition].Count
		}

		offset := topicMeta.Partitions[partition].Low
		if offsetLatest {
			offset = topicMeta.Partitions[partition].High - count
			if offset < topicMeta.Partitions[partition].Low {
				offset = topicMeta.Partitions[partition].Low
			}
		}

		if count > topicMeta.Partitions[partition].Count {
			count = topicMeta.Partitions[partition].Count
		}

		consumer.Assign([]kafka.TopicPartition{{Topic: &topic, Partition: int32(partition), Offset: kafka.Offset(offset)}})

		for i := int64(0); i < count; i++ {
			msg, err := consumer.ReadMessage(5 * time.Second)
			if err != nil {
				break
			}

			headers := make([]HeaderArg, len(msg.Headers))
			for i, h := range msg.Headers {
				headers[i] = HeaderArg{Key: h.Key, Value: string(h.Value)}
			}

			kafkaMessage := KafkaMessage{
				Topic:     *msg.TopicPartition.Topic,
				Offset:    int64(msg.TopicPartition.Offset),
				Value:     string(msg.Value),
				Key:       string(msg.Key),
				Timestamp: msg.Timestamp.Unix(),
				Partition: msg.TopicPartition.Partition,
				Headers:   headers,
				Size:      int64(len(msg.Value)),
			}

			messages = append(messages, kafkaMessage)
		}
	}

	return &TopicData{
		Metadata: *topicMeta,
		Messages: messages,
	}, nil

}

func (k *KafkaService) GetTopicSettings(config KafkaConfig, topic string) (map[string]string, error) {
	adminClient, err := kafka.NewAdminClient(&kafka.ConfigMap{
		"bootstrap.servers": config.BootstrapServers,
		"security.protocol": config.Protocol,
		"sasl.mechanism":    config.SaslMechanism,
		"sasl.username":     config.SaslUsername,
		"sasl.password":     config.SaslPassword,
	})
	if err != nil {
		return nil, err
	}
	defer adminClient.Close()

	resource := kafka.ConfigResource{
		Type: kafka.ResourceTopic,
		Name: topic,
	}

	results, err := adminClient.DescribeConfigs(context.Background(), []kafka.ConfigResource{resource})
	if err != nil {
		return nil, err
	}

	settings := make(map[string]string)
	for _, result := range results {
		if result.Error.Code() != kafka.ErrNoError {
			continue
		}
		for _, entry := range result.Config {
			settings[entry.Name] = entry.Value
		}
	}

	return settings, nil
}

func createProducer(config KafkaConfig) (*kafka.Producer, error) {
	producerConfig := &kafka.ConfigMap{
		"bootstrap.servers": config.BootstrapServers,
		"security.protocol": config.Protocol,
		"sasl.mechanism":    config.SaslMechanism,
		"sasl.username":     config.SaslUsername,
		"sasl.password":     config.SaslPassword,
	}

	if config.SaslMechanism == "" {
		delete(*producerConfig, "sasl.mechanism")
	}
	if config.SaslUsername == "" {
		delete(*producerConfig, "sasl.username")
	}
	if config.SaslPassword == "" {
		delete(*producerConfig, "sasl.password")
	}

	return kafka.NewProducer(producerConfig)
}

func createConsumer(config KafkaConfig) (*kafka.Consumer, error) {
	consumerConfig := &kafka.ConfigMap{
		"bootstrap.servers": config.BootstrapServers,
		"group.id":          config.GroupID,
		"auto.offset.reset": config.AutoOffsetReset,
		"security.protocol": config.Protocol,
		"sasl.mechanism":    config.SaslMechanism,
		"sasl.username":     config.SaslUsername,
		"sasl.password":     config.SaslPassword,
	}

	if config.SaslMechanism == "" {
		delete(*consumerConfig, "sasl.mechanism")
	}
	if config.SaslUsername == "" {
		delete(*consumerConfig, "sasl.username")
	}
	if config.SaslPassword == "" {
		delete(*consumerConfig, "sasl.password")
	}

	return kafka.NewConsumer(consumerConfig)
}
