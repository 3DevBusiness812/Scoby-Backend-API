import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MqConfig } from '../../config/mq.config';
import stomp from 'stompit';
import { EventEmitter } from 'events';

@Injectable()
export class MqService extends EventEmitter implements OnModuleInit {
  config: Omit<MqConfig, 'queues'>;
  queues: MqConfig['queues'];
  manager: stomp.ConnectFailover;
  channelPool: stomp.ChannelPool;

  private readonly logger = new Logger(MqService.name);

  constructor(private configService: ConfigService) {
    super();
    const { queues, ...mqConfig } = this.configService.get('mq') as MqConfig;
    this.config = mqConfig;
    this.queues = queues;

    const connectionOptions = {
      host: this.config.host,
      port: this.config.port,
      ssl: this.config.ssl as any,
      connectHeaders: {
        login: this.config.username,
        passcode: this.config.password,
        'heart-beat': '2500, 5000',
      },
    };
    const connections = [connectionOptions];

    if (mqConfig.spareHost) {
      connections.push({ ...connectionOptions, host: mqConfig.spareHost });
    }

    this.manager = new stomp.ConnectFailover(connections, {
      maxReconnectDelay: 5000,
    });
  }

  async onModuleInit(): Promise<void> {
    this.channelPool = new stomp.ChannelPool(this.manager);
    this.manager.on('error', (err) =>
      this.logger.error('MQ Connection error:', JSON.stringify(err)),
    );
  }

  private async _getChannel(): Promise<stomp.Channel> {
    return new Promise((resolve, reject) => {
      this.channelPool.channel((err, channel) =>
        err ? reject(err) : resolve(channel),
      );
    });
  }

  private async _sendMessage(
    channel: stomp.Channel,
    destination: string,
    message: string | { [key: string]: any },
    persistent: boolean,
  ) {
    return new Promise<void>((resolve, reject) => {
      channel.send(
        { destination, persistent },
        JSON.stringify(message),
        (err) => (err ? reject(err) : resolve()),
      );
    });
  }

  private _subscribe(
    channel: stomp.Channel,
    destination: string,
    ack: string,
    handler: (message: string | { [key: string]: any }) => any,
  ) {
    channel.subscribe({ destination, ack }, (err, message) => {
      if (err) {
        this.logger.error('Messsage receive failed:', JSON.stringify(err));
        return;
      }

      message.readString('utf8', (err, messageString) => {
        if (err) {
          this.logger.error('Message read failed:', JSON.stringify(err));
          return;
        }

        handler(JSON.parse(messageString as string));
      });
    });
  }

  async send(
    queue: string,
    message: string | { [key: string]: any },
    persistent = true,
  ): Promise<void> {
    const channel = await this._getChannel();
    await this._sendMessage(channel, queue, message, persistent);
  }

  async subscribe(
    queue: string,
    handler: (message: string | { [key: string]: any }) => any,
    ack: 'auto' | 'client' | 'client-individual' = 'auto',
  ): Promise<void> {
    const channel = await this._getChannel();
    this._subscribe(channel, queue, ack, handler);
  }
}
