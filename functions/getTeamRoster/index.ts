import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as Airtable from 'airtable';

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const roster = new Array();

    try {
        await base('Team Roster').select({
            fields: ['CA Name', 'Microsoft Email Alias','Active'],
            sort: [{ field: 'CA Name' }],
            filterByFormula: `Active=1`
        }).eachPage((records, fetchNextPage) => {
            // console.log('Got some team records', records);

            records.forEach((value) => {
                roster.push({
                    id: value.id,
                    name: value.fields['CA Name'],
                    alias: value.fields['Microsoft Email Alias']
                });
            });

            fetchNextPage();
        });

        context.res = {
            body: JSON.stringify(roster)
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: err
        };
    }

};

export default httpTrigger;
