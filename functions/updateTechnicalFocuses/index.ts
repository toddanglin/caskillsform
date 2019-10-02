import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as Airtable from 'airtable';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    const id = (req.query.id || req.headers.id || (req.body && req.body.id));
    const primaryLangIds = (req.body && req.body.primaryLangIds);
    const secondaryLangIds = (req.body && req.body.secondaryLangIds);
    const primaryTechIds = (req.body && req.body.primaryTechIds);
    const secondaryTechIds = (req.body && req.body.secondaryTechIds);

    try {
        if (id === undefined || id === '') {
            throw Error('Missing input parameter: "id" is required');
        }

        if (primaryLangIds === undefined) {
            throw Error('Missing input parameter: "primaryLangIds" is required');
        }
        if (secondaryLangIds === undefined) {
            throw Error('Missing input parameter: "secondaryLangIds" is required');
        }
        if (primaryTechIds === undefined) {
            throw Error('Missing input parameter: "primaryTechIds" is required');
        }
        if (secondaryTechIds === undefined) {
            throw Error('Missing input parameter: "secondaryTechIds" is required');
        }

        await base('Team Roster').update([
            {
                id,
                fields: {
                    'Primary Languages': primaryLangIds,
                    'Secondary Languages': secondaryLangIds,
                    'Primary Topics': primaryTechIds,
                    'Secondary Topics': secondaryTechIds,
                }
            }
        ]);

        context.res = {
            body: `Update for ${id} succeeded`
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: error.toString()
        };
    }
};

export default httpTrigger;
