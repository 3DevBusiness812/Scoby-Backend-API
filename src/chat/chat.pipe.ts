import Joi from '@hapi/joi';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { ChatRoomObject } from './chat.graphql';
import { CHAT_ERROR } from './chat.messages';
import { ChatService } from './chat.service';

@Injectable()
export class ChatRoomCreationPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  async transform(value: ChatRoomObject, metadata: ArgumentMetadata) {
    switch (metadata.data) {
      case 'messageText': {
        await Joi.string()
          .label(metadata.data)
          .min(1)
          .message(CHAT_ERROR.CHAT_ROOM_CREATION)
          .validateAsync(value);
        break;
      }
      case 'participants': {
        await Joi.array()
          .items(Joi.number().integer().positive())
          .min(1)
          .message(CHAT_ERROR.CHAT_ROOM_CREATION)
          .validateAsync(value);
        break;
      }
      default: {
        return value;
      }
    }

    return value;
  }
}

@Injectable()
export class ChatMessageCreationPipe implements PipeTransform {
  constructor(
    private configService: ConfigService,
    private chatService: ChatService,
  ) {}

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    switch (metadata.data) {
      case 'text': {
        await Joi.string()
          .label(metadata.data)
          .min(1)
          .message(CHAT_ERROR.CHAT_ROOM_CREATION)
          .validateAsync(value);
        break;
      }
      case 'room': {
        await this.roomExistingCheck(value as number);
        break;
      }
      default: {
        return value;
      }
    }
    return value;
  }

  async roomExistingCheck(id: number): Promise<void> {
    const room = await this.chatService.getChatRoomById(id);
    ExecutionContextHost
    if (!room) throw new Error(CHAT_ERROR.ROOM_DOESNT_EXIST);
  }
}
