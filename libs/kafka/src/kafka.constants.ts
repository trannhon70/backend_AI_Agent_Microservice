export class KafkaConstants {
    public static InjectionTokens = {
        Client: Symbol('KAFKA_SERVICE'),
    };

    public static ClientId = 'nestjs-kafka-consumer';
    public static ConsumerGroups = {
        Default: 'nestjs-kafka-consumer-group',
    };
}