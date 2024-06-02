import { KafkaMessage } from '@/store/dataSlice';

export type KafkaProtocol = 'SASL_PLAINTEXT' | 'SASL_SSL' | 'PLAINTEXT' | 'SSL';

export type SaslMechanism =
  | 'PLAIN'
  | 'GSSAPI'
  | 'SCRAM-SHA-256'
  | 'SCRAM-SHA-512'
  | 'OAUTHBEARER'
  | 'AWS-MSK-IAM';

export type Offset = 'earliest' | 'latest' | 'offset';

export type DataFormat = 'JSON' | 'XML' | 'TEXT' | 'HEX';

export type DataField = keyof KafkaMessage;
// | 'key'
// | 'partition'
// | 'offset'
// | 'value'
// | 'timestamp'
// | 'headers';
