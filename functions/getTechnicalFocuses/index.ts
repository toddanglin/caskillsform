import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as Airtable from 'airtable';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const tech = new Array();

    try {
        await base('Topics').select({
            fields: ['Name'],
            sort: [{ field: 'Name' }],
            view: 'Advocate Topics'
        }).eachPage((records, fetchNextPage) => {
            // console.log('Got some tech focus areas', records);

            records.forEach((value) => {
                tech.push({
                    id: value.id,
                    name: value.fields['Name']
                });
            });

            fetchNextPage();
        });

        context.res = {
            body: JSON.stringify(tech)
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: err
        };
    }
};

export default httpTrigger;
