import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TeamRosterService {
  private functionKey = '$(airtableFunctionKey)';
  private apiUrlBase = 'https://ca-skillsform-airtable-api.azurewebsites.net/api';

  constructor(private httpClient: HttpClient) {
  }

  public async getTeamRoster(): Promise<Array<any>> {
    return await this.getData('getTeamRoster');
  }

  public async getProgrammingLanguages(): Promise<Array<any>> {
    return await this.getData('getProgrammingLanguages');
  }

  public async getTechnicalFocuses(): Promise<Array<any>> {
    return await this.getData('getTechnicalFocuses');
  }

  public async getTechnicalFocusesByAlias(alias: string): Promise<any> {
    return await this.getData(`getTechnicalFocusesByAlias?alias=${alias}`, false);
  }

  public async updateTechnicalFocuses(id: string,
                                      primaryLangIds: Array<string>,
                                      primaryTechIds: Array<string>,
                                      secondaryLangIds?: Array<string>,
                                      secondaryTechIds?: Array<string>): Promise<void> {

    const payload = {
      id,
      primaryLangIds,
      secondaryLangIds,
      primaryTechIds,
      secondaryTechIds,
    };

    const url = `${this.apiUrlBase}/updateTechnicalFocuses`;
    const options = this.prepareRequestOptions('POST', payload);

    try {
      const resp = await fetch(url, options);

      if (resp.status !== 200) {
        throw Error(`Error with updateTechnical: ${await resp.text()}`);
      }

      const msg = await resp.text();
      console.log(msg);

    } catch (error) {
      console.warn('Oops. Something happened.', error);

      // TODO: User error message
      throw Error(error);
    }
  }

  private async getData(methodName, useCache = true): Promise<Array<any>> {
    // Check cache
    if (useCache && sessionStorage.getItem(methodName) !== null) {
      return JSON.parse(sessionStorage.getItem(methodName));
    }

    const url = `${this.apiUrlBase}/${methodName}`;
    const options = this.prepareRequestOptions();

    try {
      const resp = await fetch(url, options);

      if (resp.status !== 200) {
        throw Error(`Error with ${methodName}: ${await resp.text()}`);
      }

      const results = await resp.json();
      console.log(methodName, results);

      if (results !== undefined) {
        // Cache results
        if (useCache) {
          sessionStorage.setItem(methodName, JSON.stringify(results));
        }

        return results;
      } else {
        return new Array(); // Empty result set
      }

    } catch (error) {
      console.warn('Oops. Something happened.', error);

      // TODO: User error message
    }
  }

  private prepareRequestOptions(method = 'GET', payload?: any) {
    const options =  {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'x-functions-key': this.functionKey
      }
    };

    if (method !== 'GET' && payload !== undefined) {
      options['body'] = JSON.stringify(payload);
    }

    return options;
  }
}
