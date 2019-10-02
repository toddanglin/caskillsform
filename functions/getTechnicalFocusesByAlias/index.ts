import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as Airtable from 'airtable';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    let skills;

    const alias = (req.query['alias'] || req.headers['alias'] || (req.body && req.body.alias));

    try {
        if (alias === undefined) {
            throw Error('Missing input parameter: "alias" is required');
        }

        await base('Team Roster').select({
            fields: ['Primary Languages', 'Secondary Languages', 'Primary Topics', 'Secondary Topics'],
            filterByFormula: `{Microsoft Email Alias}='${alias}'`
        }).eachPage((records, fetchNextPage) => {
            const r = records[0];
            skills = {
                id: r.id,
                primaryLangs: r.fields['Primary Languages'],
                secondaryLangs: r.fields['Secondary Languages'],
                primaryTech: r.fields['Primary Topics'],
                secondaryTech: r.fields['Secondary Topics']
            };

            // console.log('Alias skills to return', skills);
            fetchNextPage();
        });

        context.res = {
            body: JSON.stringify(skills)
        };
    } catch (err) {
        console.warn('Ugh. Something didn\'t work', err);
        context.res = {
            status: 500,
            body: err.toString()
        };
    }
};

export default httpTrigger;
