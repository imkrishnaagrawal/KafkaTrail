package main

import (
	"crypto/tls"
	"time"

	"github.com/IBM/sarama"
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
	consumer, err := createConsumer(config)
	if err != nil {
		return "", err
	}
	defer consumer.Close()

	return "Connection Validated", nil
}

func (k *KafkaService) FetchTopics(config KafkaConfig) ([]string, error) {
	consumer, err := createConsumer(config)
	if err != nil {
		return nil, err
	}
	defer consumer.Close()

	topics, err := consumer.Topics()
	if err != nil {
		return nil, err
	}

	return topics, nil
}

func (k *KafkaService) ProduceMessage(config KafkaConfig, message ProducerMessage) (string, error) {
	producer, err := createProducer(config)
	if err != nil {
		return "", err
	}
	defer producer.Close()

	headers := make([]sarama.RecordHeader, len(message.Headers))
	for i, h := range message.Headers {
		headers[i] = sarama.RecordHeader{Key: []byte(h.Key), Value: []byte(h.Value)}
	}

	msg := &sarama.ProducerMessage{
		Topic:   message.Topic,
		Key:     sarama.StringEncoder(message.Key),
		Value:   sarama.StringEncoder(message.Value),
		Headers: headers,
	}

	_, _, err = producer.SendMessage(msg)
	if err != nil {
		return "", err
	}

	return "Message produced", nil
}

func (k *KafkaService) FetchMeta(config KafkaConfig, topic string, partition int32, count int64, offsetLatest bool) (*TopicMeta, error) {
	client, err := createClient(config)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	partitions, err := client.Partitions(topic)
	if err != nil {
		return nil, err
	}

	totalMessage := int64(0)
	partitionMessages := make([]PartitionMeta, len(partitions))

	for i, partition := range partitions {
		oldestOffset, err := client.GetOffset(topic, partition, sarama.OffsetOldest)
		if err != nil {
			return nil, err
		}

		newestOffset, err := client.GetOffset(topic, partition, sarama.OffsetNewest)
		if err != nil {
			return nil, err
		}

		totalMessagesInPartition := newestOffset - oldestOffset
		partitionMessages[i] = PartitionMeta{newestOffset, oldestOffset, totalMessagesInPartition}
		totalMessage += totalMessagesInPartition
	}

	return &TopicMeta{
		MessageCount:   totalMessage,
		PartitionCount: len(partitions),
		Partitions:     partitionMessages,
	}, nil
}

func (k *KafkaService) FetchMessages(config KafkaConfig, topic string, partition int32, count int64, offsetLatest bool) (*TopicData, error) {
	consumer, err := createConsumer(config)
	if err != nil {
		return nil, err
	}
	defer consumer.Close()

	topicMeta, err := k.FetchMeta(config, topic, partition, count, offsetLatest)
	if err != nil {
		return nil, err
	}

	messages := make([]KafkaMessage, 0)
	for pIndex, p := range topicMeta.Partitions {
		pc, err := consumer.ConsumePartition(topic, int32(pIndex), p.Low)
		if err != nil {
			return nil, err
		}
		defer pc.Close()

		for i := int64(0); i < p.Count; i++ {
			select {
			case msg := <-pc.Messages():
				headers := make([]HeaderArg, len(msg.Headers))
				for i, h := range msg.Headers {
					headers[i] = HeaderArg{Key: string(h.Key), Value: string(h.Value)}
				}

				kafkaMessage := KafkaMessage{
					Topic:     msg.Topic,
					Offset:    msg.Offset,
					Value:     string(msg.Value),
					Key:       string(msg.Key),
					Timestamp: msg.Timestamp.Unix(),
					Partition: msg.Partition,
					Headers:   headers,
					Size:      int64(len(msg.Value)),
				}

				messages = append(messages, kafkaMessage)
			case <-time.After(5 * time.Second):
				break
			}
		}
	}

	return &TopicData{
		Metadata: *topicMeta,
		Messages: messages,
	}, nil
}

func (k *KafkaService) GetTopicSettings(config KafkaConfig, topic string) (map[string]string, error) {
	admin, err := createAdmin(config)
	if err != nil {
		return nil, err
	}
	defer admin.Close()

	request := sarama.ConfigResource{

		Type: sarama.TopicResource,
		Name: topic,
	}
	// admin.DescribeConfig()

	response, err := admin.DescribeConfig(request)

	if err != nil {
		return nil, err
	}

	settings := make(map[string]string)
	for _, entry := range response {
		settings[entry.Name] = entry.Value
	}

	return settings, nil
}

func getClientConfig(config KafkaConfig) *sarama.Config {
	clientConfig := sarama.NewConfig()
	// clientConfig.ClientID = "kafka-trial"
	// clientConfig.Version = sarama.V
	if config.Protocol == "SASL_SSL" {
		clientConfig.Net.SASL.Enable = true
		clientConfig.Net.SASL.Mechanism = sarama.SASLTypePlaintext
		clientConfig.Net.SASL.User = config.SaslUsername
		clientConfig.Net.SASL.Password = config.SaslPassword
		clientConfig.Net.TLS.Enable = true
		clientConfig.Net.TLS.Config = &tls.Config{
			InsecureSkipVerify: true,
			ClientAuth:         0,
		}

	}

	return clientConfig

}
func createClient(config KafkaConfig) (sarama.Client, error) {
	clientConfig := getClientConfig(config)
	client, err := sarama.NewClient([]string{config.BootstrapServers}, clientConfig)
	if err != nil {
		return nil, err
	}

	return client, nil
}
func createAdmin(config KafkaConfig) (sarama.ClusterAdmin, error) {
	adminConfig := getClientConfig(config)

	admin, err := sarama.NewClusterAdmin([]string{config.BootstrapServers}, adminConfig)
	if err != nil {
		return nil, err
	}

	return admin, nil
}

func createProducer(config KafkaConfig) (sarama.SyncProducer, error) {
	producerConfig := getClientConfig(config)
	producerConfig.Producer.RequiredAcks = sarama.WaitForAll
	producerConfig.Producer.Retry.Max = 5
	producerConfig.Producer.Return.Successes = true

	producer, err := sarama.NewSyncProducer([]string{config.BootstrapServers}, producerConfig)
	if err != nil {
		return nil, err
	}

	return producer, nil
}

func createConsumer(config KafkaConfig) (sarama.Consumer, error) {
	consumerConfig := getClientConfig(config)
	consumerConfig.Consumer.Return.Errors = true
	consumerConfig.Consumer.Offsets.Initial = sarama.OffsetOldest

	consumer, err := sarama.NewConsumer([]string{config.BootstrapServers}, consumerConfig)
	if err != nil {
		return nil, err
	}

	return consumer, nil
}
