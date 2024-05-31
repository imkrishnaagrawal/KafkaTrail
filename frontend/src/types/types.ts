export type KAFKA_PROTOCOL =
  | 'SASL_PLAINTEXT'
  | 'SASL_SSL'
  | 'PLAINTEXT'
  | 'SSL';

export type SASL_MECHANISM =
  | 'PLAIN'
  | 'GSSAPI'
  | 'SCRAM-SHA-256'
  | 'SCRAM-SHA-512'
  | 'OAUTHBEARER'
  | 'AWS-MSK-IAM';

export type OFFSET = 'earliest' | 'latest' | 'offset';

export type DATA_FORMAT = 'JSON' | 'XML' | 'TEXT' | 'HEX';

export type DATA_FIELD = 'key' | 'partition' | 'offset' | 'value' | 'timestamp' | 'headers';
