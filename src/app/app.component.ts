import { Component, OnInit } from '@angular/core';
import { TeamRosterService } from './team-roster.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Cloud Advocacy Skills Inventory';
  isLoading = false;
  isSuccess = true;
  isMessageVisible = false;
  message = 'This is a default test message';

  programmingLanguages = [];
  techFocuses = [];
  selectedPrimaryLangs = [];
  selectedSecondaryLangs = [];
  selectedAlias = [];
  selectedPrimaryTech = [];
  selectedSecondaryTech = [];
  roster = [];

  langDropdownSettings = {};
  rosterDropdownSettings = {};
  techDropdownSettings = {};

  primaryTechValid = true;
  primaryLangValid = true;
  aliasValid = true;

  constructor(private rosterSvc: TeamRosterService) {
  }

  ngOnInit() {

    this.rosterSvc.getTeamRoster()
      .then((roster) => {
        roster.forEach((value, i) => {
          this.roster.push({
            item_id: value.id,
            item_text: value.alias
          });
        });
      });

    this.rosterSvc.getProgrammingLanguages()
      .then((langs) => {
        langs.forEach((value, i) => {
          this.programmingLanguages.push({
            item_id: value.id,
            item_text: value.name
          });
        });
      });

    this.rosterSvc.getTechnicalFocuses()
      .then((techs) => {
        techs.forEach((value, i) => {
          this.techFocuses.push({
            item_id: value.id,
            item_text: value.name
          });
        });
      });

    this.rosterDropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      limitSelection: 1,
      allowSearchFilter: true
    };

    this.langDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      limitSelection: 3,
      allowSearchFilter: true
    };

    this.techDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true
    };
  }

  public submitForm() {
    // Do some quick and dirty required form validation
    this.primaryTechValid = (this.selectedPrimaryTech.length <= 0) ? false : true;
    this.primaryLangValid = (this.selectedPrimaryLangs.length <= 0) ? false : true;
    this.aliasValid = (this.selectedAlias.length <= 0) ? false : true;

    if (!this.primaryTechValid || !this.primaryLangValid || !this.aliasValid) {
      return;
    }

    this.isLoading = true;

    const id = this.selectedAlias[0].item_id;
    const primaryLangIds = this.selectedPrimaryLangs.map((v) => v.item_id);
    const secondaryLangIds = this.selectedSecondaryLangs.map((v) => v.item_id);
    const primaryTechIds = this.selectedPrimaryTech.map((v) => v.item_id);
    const secondaryTechIds = this.selectedSecondaryTech.map((v) => v.item_id);

    this.rosterSvc.updateTechnicalFocuses(id, primaryLangIds, primaryTechIds, secondaryLangIds, secondaryTechIds)
      .then(() => {
        console.log('Skills updated successfully');
        this.isSuccess = true;
        this.message = `Your skills were successfully saved in AirTable. If you want to make any changes, just run through this form again.
                        Thank you for helping keep our team inventory up-to-date!`;
      })
      .catch((err) => {
        console.warn('Something went wrong updating skills', err);
        this.isSuccess = false;
        this.message = `Sorry. Something went wrong trying to save your skills to AirTable.
                        Please try again. If the problem persists, let the Cloud Advocacy AirTable v-team know.`;
      })
      .finally(() => {
        this.isMessageVisible = true;
        this.isLoading = false;
      });
  }

  public onAliasSelect(item: any) {
    const alias = item.item_text;

    this.rosterSvc.getTechnicalFocusesByAlias(alias)
      .then((skills) => {
        if (skills.primaryLangs !== undefined) {
          this.selectedPrimaryLangs = skills.primaryLangs.map((v) => {
            return this.programmingLanguages.find((p) => p.item_id === v);
          });
        }
        if (skills.secondaryLangs !== undefined) {
          this.selectedSecondaryLangs = skills.secondaryLangs.map((v) => {
            return this.programmingLanguages.find((p) => p.item_id === v);
          });
        }
        if (skills.primaryTech !== undefined) {
          this.selectedPrimaryTech = skills.primaryTech.map((v) => {
            return this.techFocuses.find((p) => p.item_id === v);
          });
        }
        if (skills.secondaryTech !== undefined) {
          this.selectedSecondaryTech = skills.secondaryTech.map((v) => {
            return this.techFocuses.find((p) => p.item_id === v);
          });
        }
      })
      .catch((err) => {
        console.warn('Something went wrong getting tech skills', err);
      });
  }

  public onAliasDeselect(item: any) {
    this.selectedPrimaryLangs = [];
    this.selectedSecondaryLangs = [];
    this.selectedPrimaryTech = [];
    this.selectedSecondaryTech = [];
  }

  public hideMessage() {
    this.isMessageVisible = false;
  }
}
