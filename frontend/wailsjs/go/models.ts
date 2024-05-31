export namespace main {
	
	export class HeaderArg {
	    key: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new HeaderArg(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	    }
	}
	export class KafkaConfig {
	    connectionName?: string;
	    bootstrapServers: string;
	    groupId: string;
	    autoOffsetReset: string;
	    protocol: string;
	    saslMechanism?: string;
	    saslUsername?: string;
	    saslPassword?: string;
	    lastUsed?: string;
	    isTestConnection?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new KafkaConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.connectionName = source["connectionName"];
	        this.bootstrapServers = source["bootstrapServers"];
	        this.groupId = source["groupId"];
	        this.autoOffsetReset = source["autoOffsetReset"];
	        this.protocol = source["protocol"];
	        this.saslMechanism = source["saslMechanism"];
	        this.saslUsername = source["saslUsername"];
	        this.saslPassword = source["saslPassword"];
	        this.lastUsed = source["lastUsed"];
	        this.isTestConnection = source["isTestConnection"];
	    }
	}
	export class KafkaMessage {
	    topic: string;
	    offset: number;
	    value: string;
	    key: string;
	    timestamp: number;
	    partition: number;
	    headers: HeaderArg[];
	    size: number;
	    key_size: number;
	
	    static createFrom(source: any = {}) {
	        return new KafkaMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.topic = source["topic"];
	        this.offset = source["offset"];
	        this.value = source["value"];
	        this.key = source["key"];
	        this.timestamp = source["timestamp"];
	        this.partition = source["partition"];
	        this.headers = this.convertValues(source["headers"], HeaderArg);
	        this.size = source["size"];
	        this.key_size = source["key_size"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PartitionMeta {
	    high: number;
	    low: number;
	    count: number;
	
	    static createFrom(source: any = {}) {
	        return new PartitionMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.high = source["high"];
	        this.low = source["low"];
	        this.count = source["count"];
	    }
	}
	export class PartitionSettings {
	    partition: number;
	    high: number;
	    offset: number;
	
	    static createFrom(source: any = {}) {
	        return new PartitionSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.partition = source["partition"];
	        this.high = source["high"];
	        this.offset = source["offset"];
	    }
	}
	export class ProducerMessage {
	    topic: string;
	    key?: string;
	    value: string;
	    headers?: HeaderArg[];
	
	    static createFrom(source: any = {}) {
	        return new ProducerMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.topic = source["topic"];
	        this.key = source["key"];
	        this.value = source["value"];
	        this.headers = this.convertValues(source["headers"], HeaderArg);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TopicMeta {
	    message_count: number;
	    partition_count: number;
	    partitions: PartitionMeta[];
	
	    static createFrom(source: any = {}) {
	        return new TopicMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message_count = source["message_count"];
	        this.partition_count = source["partition_count"];
	        this.partitions = this.convertValues(source["partitions"], PartitionMeta);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TopicData {
	    metadata: TopicMeta;
	    messages: KafkaMessage[];
	
	    static createFrom(source: any = {}) {
	        return new TopicData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.metadata = this.convertValues(source["metadata"], TopicMeta);
	        this.messages = this.convertValues(source["messages"], KafkaMessage);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

