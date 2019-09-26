import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Airtable from 'airtable';

@Injectable()
export class TeamRosterService {
  private base: Airtable.Base;

  constructor(private httpClient: HttpClient) {
     this.base = new Airtable({ apiKey: 'AIR_TABLE_API_KEY'}).base('AIR_TABLE_BASE_ID');
  }

  public getTeamRoster(): Promise<Array<any>> {
    const roster = new Array();
    const TEAM_ROSTER = 'teamRoster';
    return new Promise((resolve, reject) => {
      if (sessionStorage.getItem(TEAM_ROSTER) !== null) {
        resolve(JSON.parse(sessionStorage.getItem(TEAM_ROSTER)));
        return;
      }
      this.base('Team Roster').select({
        fields: ['CDA Name', 'Microsoft Email Alias'],
        sort: [{field: 'CDA Name'}],
      }).eachPage((records, fetchNextPage) => {
        console.log('Got some team records', records);

        records.forEach((value) => {
          roster.push(value);
        });

        fetchNextPage();
      }).finally(() => {
        sessionStorage.setItem(TEAM_ROSTER, JSON.stringify(roster));
        resolve(roster);
      });
    });
  }

  public getProgrammingLanguages(): Promise<Array<any>> {
    const langs = new Array();
    const PROGRAMMING_LANGS = 'programmingLangs';
    return new Promise((resolve, reject) => {
      if (sessionStorage.getItem(PROGRAMMING_LANGS) !== null) {
        resolve(JSON.parse(sessionStorage.getItem(PROGRAMMING_LANGS)));
        return;
      }
      this.base('Technologies').select({
        fields: ['Name'],
        sort: [{field: 'Name'}],
        view: 'All Technologies (Programming Langs)'
      }).eachPage((records, fetchNextPage) => {
        console.log('Got some languages', records);

        records.forEach((value) => {
          langs.push(value);
        });

        fetchNextPage();
      }).finally(() => {
        sessionStorage.setItem(PROGRAMMING_LANGS, JSON.stringify(langs));
        resolve(langs);
      });
    });
  }

  public getTechnicalFocuses(): Promise<Array<any>> {
    const tech = new Array();
    const TECHNICAL_FOCUSES = 'technicalFocuses';
    return new Promise((resolve, reject) => {
      if (sessionStorage.getItem(TECHNICAL_FOCUSES) !== null) {
        resolve(JSON.parse(sessionStorage.getItem(TECHNICAL_FOCUSES)));
        return;
      }
      this.base('Technologies').select({
        fields: ['Name'],
        sort: [{field: 'Name'}],
        view: 'Technologies (Excluding Programming Langs)'
      }).eachPage((records, fetchNextPage) => {
        console.log('Got some tech focus areas', records);

        records.forEach((value) => {
          tech.push(value);
        });

        fetchNextPage();
      }).finally(() => {
        sessionStorage.setItem(TECHNICAL_FOCUSES, JSON.stringify(tech));
        resolve(tech);
      });
    });
  }

  public getTechnicalFocusesByAlias(alias: string): Promise<any> {
    let skills;
    return new Promise((resolve, reject) => {
      this.base('Team Roster').select({
        fields: ['Primary Languages', 'Secondary Languages', 'Primary Technology Areas', 'Secondary Technology Areas'],
        filterByFormula: `{Microsoft Email Alias}='${alias}'`
      }).eachPage((records, fetchNextPage) => {
        console.log('Got some team records', records);

        skills = records[0];
        resolve(skills);
      })
      .catch((err) => {
        console.warn('ERROR getting technical focus by alias', err);
        reject(err);
      });
    });
  }

  public updateTechnicalFocuses(id: string,
                                primaryLangIds: Array<string>,
                                primaryTechIds: Array<string>,
                                secondaryLangIds?: Array<string>,
                                secondaryTechIds?: Array<string>): Promise<void> {

      return new Promise((resolve, reject) => {
        if (id === undefined || id === '') {
          reject('ID is required');
        }

        this.base('Team Roster').update([
          {
            id,
            fields: {
              'Primary Languages': primaryLangIds,
              'Secondary Languages': secondaryLangIds,
              'Primary Technology Areas': primaryTechIds,
              'Secondary Technology Areas': secondaryTechIds,
            }
          }
        ])
        .then((result) => {
          console.log('UPDATE COMPLETE', result);
          resolve();
        })
        .catch((err) => {
          console.warn('UPDATE ERROR', err);
          reject(err);
        });
      });
  }
}
