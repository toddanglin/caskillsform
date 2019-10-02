import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as Airtable from 'airtable';

const httpTrigger: AzureFunction = async function(context: Context, req: HttpRequest): Promise<void> {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const langs = new Array();

    try {
        await base('Technologies').select({
            fields: ['Name'],
            sort: [{ field: 'Name' }],
            view: 'All Technologies (Programming Langs)'
        }).eachPage((records, fetchNextPage) => {
            // console.log('Got some languages', records);

            records.forEach((value) => {
                langs.push({
                    id: value.id,
                    name: value.fields['Name']
                });
            });

            fetchNextPage();
        });

        context.res = {
            body: JSON.stringify(langs)
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: err
        };
    }
};

export default httpTrigger;
