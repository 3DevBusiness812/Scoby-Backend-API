import { Logger, Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import qs from 'qs';
import { KartraConfig } from '../../config/kartra.config';
import { ApolloError } from 'apollo-server-express';
import { KARTRA_ERRORS } from './kartra.messages';
import {
  LeadCreation,
  LeadSuscriptionList,
  responseKartra,
} from 'src/users/users.graphql';

@Injectable()
export class KartraService {
  config: KartraConfig;

  private readonly logger = new Logger(KartraService.name);

  constructor(private configService: ConfigService) {
    this.config = this.configService.get('kartra') as KartraConfig;
  }

  async createLead({
    email,
    firstName,
    lastName,
  }: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<LeadCreation> {
    try {
      const result = await axios.post(
        this.config.apiUrl,
        qs.stringify({
          app_id: this.config.appId,
          api_key: this.config.apiKey,
          api_password: this.config.apiPassword,
          'lead[email]': email,
          'lead[first_name]': firstName,
          'lead[last_name]': lastName,
          'actions[0][cmd]': 'create_lead',
          'actions[1][cmd]': 'assign_tag',
          'actions[1][tag_name]': 'Signup from App',
        }),
      );

      /* if (result.data.status === 'Error') {
        throw new Error(`${result.data.type}: ${result.data.message}`);
      }*/

      return { email, firstName, lastName };
    } catch (e) {
      this.logger.error('Kartra request failed', e);
      throw new ApolloError(
        KARTRA_ERRORS.REQUEST_FAILED.MESSAGE,
        KARTRA_ERRORS.REQUEST_FAILED.CODE,
      );
    }
  }

  async suscribeLeadToWaitingList({
    email,
    name,
  }: LeadSuscriptionList): Promise<LeadSuscriptionList> {
    try {
      const result = await axios.post(
        this.config.apiUrl,
        qs.stringify({
          app_id: this.config.appId,
          api_key: this.config.apiKey,
          api_password: this.config.apiPassword,
          'lead[email]': email,
          'lead[first_name]': name,
          'actions[0][cmd]': 'subscribe_lead_to_list',
          'actions[0][list_name]': 'App Wait List',
        }),
      );

      if (result.data.status === 'Error') {
        throw new Error(`${result.data.type}: ${result.data.message}`);
      }

      return { email, name };
    } catch (e) {
      console.error('Kartra request failed', e);
      throw new ApolloError(
        KARTRA_ERRORS.REQUEST_FAILED.MESSAGE,
        KARTRA_ERRORS.REQUEST_FAILED.CODE,
      );
    }
  }

  async kartraSuscribeLeadCalendar(
    email: string,
    name: string,
    className: string,
  ): Promise<responseKartra> {
    try {
      const result = await axios.post(
        this.config.apiUrl,
        qs.stringify({
          app_id: this.config.appId,
          api_key: this.config.apiKey,
          api_password: this.config.apiPassword,
          'lead[email]': email,
          'actions[0][calendar_name]': name,
          'actions[0][class_name]': className,
          'actions[0][cmd]': 'calendar_subscribe',
        }),
      );

      const { message, type } = result.data.actions[0].calendar_subscribe;

      return { message, type };
    } catch (e) {
      console.error('Kartra request failed', e);
      throw new ApolloError(
        KARTRA_ERRORS.REQUEST_FAILED.MESSAGE,
        KARTRA_ERRORS.REQUEST_FAILED.CODE,
      );
    }
  }

  async kartraUnsubscribeCalendar(
    email: string,
    name: string,
    className: string,
  ): Promise<responseKartra> {
    try {
      const result = await axios.post(
        this.config.apiUrl,
        qs.stringify({
          app_id: this.config.appId,
          api_key: this.config.apiKey,
          api_password: this.config.apiPassword,
          'lead[email]': email,
          'actions[0][calendar_name]': name,
          'actions[0][class_name]': className,
          'actions[0][cmd]': 'calendar_cancel',
        }),
      );
      const { message, type } = result.data.actions[0].calendar_cancel;

      return { message, type };
    } catch (e) {
      console.error('Kartra request failed', e);
      throw new ApolloError(
        KARTRA_ERRORS.REQUEST_FAILED.MESSAGE,
        KARTRA_ERRORS.REQUEST_FAILED.CODE,
      );
    }
  }

  async getUserKartra(email: string): Promise<void> {
    try {
      const result = await axios.post(
        this.config.apiUrl,
        qs.stringify({
          app_id: this.config.appId,
          api_key: this.config.apiKey,
          api_password: this.config.apiPassword,
          'get_lead[email]': email,
        }),
      );

      if (result.data.status === 'Error') {
        throw new Error(`${result.data.type}: ${result.data.message}`);
      }
    } catch (e) {
      console.error('Kartra request failed', e);
      throw new ApolloError(
        KARTRA_ERRORS.REQUEST_FAILED.MESSAGE,
        KARTRA_ERRORS.REQUEST_FAILED.CODE,
      );
    }
  }
}
