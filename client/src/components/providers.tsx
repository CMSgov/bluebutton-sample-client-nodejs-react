import { Table, TableBody, TableCell, TableHead, TableRow } from '@cmsgov/design-system';
import jp from 'jsonpath';

export type Provider = {
    name?: string,
    specialties: string[],
    prescriber: 'yes' | 'no'
}

/* 
Use the NPI registry to lookup the providers name and other information about them
https://npiregistry.cms.hhs.gov/api/demo?version=2.1
For this sample app, since the NPI isn't real, we are going to create fake data
*/
const npiLookupResults = {
    "result_count": 1,
    "results": [
        {
            "enumeration_type": "NPI-1",
            "number": 999999999999999,
            "last_updated_epoch": Date.now(),
            "created_epoch": Date.now(),
            "basic": {
                "name_prefix": "DR.",
                "first_name": "FAKE",
                "last_name": "PERSON",
                "middle_name": "Z",
                "credential": "M.D.",
                "sole_proprietor": "NO",
                "gender": "F",
                "enumeration_date": "2021-06-12",
                "last_updated": "2021-08-15",
                "status": "A",
                "name": "FAKE PERSON"
            },
            "other_names": [],
            "addresses": [
                {
                    "country_code": "US",
                    "country_name": "United States",
                    "address_purpose": "LOCATION",
                    "address_type": "DOM",
                    "address_1": "1 FAKE STREET",
                    "address_2": "",
                    "city": "LOS ANGELES",
                    "state": "CA",
                    "postal_code": "555555555",
                    "telephone_number": "555-555-5555",
                    "fax_number": "555-555-5555"
                },
                {
                    "country_code": "US",
                    "country_name": "United States",
                    "address_purpose": "MAILING",
                    "address_type": "DOM",
                    "address_1": "1 FAKE STREET",
                    "address_2": "",
                    "city": "LOS ANGELES",
                    "state": "CA",
                    "postal_code": "555555555",
                    "telephone_number": "555-555-5555",
                    "fax_number": "555-555-5555"
                }
            ],
            "taxonomies": [
                {
                    "code": "208C00000X",
                    "desc": "Colon & Rectal Surgery",
                    "primary": false,
                    "state": "CA",
                    "license": "D5555555"
                },
                {
                    "code": "208600000X",
                    "desc": "Surgery",
                    "primary": true,
                    "state": "CA",
                    "license": "D5555555"
                }
            ],
            "identifiers": [
                {
                    "identifier": "555555555",
                    "code": "05",
                    "desc": "MEDICAID",
                    "state": "CA",
                    "issuer": ""
                }
            ]
        }
    ]
}
export default function Providers({ eobData }: { eobData?: any }) {
    let providers: Provider[] = [];

    if (eobData && eobData.entry && eobData.entry.length > 0) {
        providers = eobData.entry.map((eobItem: any, index: number) => {
            const identifierType = jp.value(eobItem, `$.resource.careTeam[${index}].provider.identifier.type.coding[0].code`);
            const roleType = jp.value(eobItem, `$.resource.careTeam[${index}].role.coding[0].code`);
            const npi = identifierType === 'npi' ? jp.value(eobItem, `$.resource.careTeam[${index}].provider.identifier.value`) : undefined;
            const provider: Provider = {
                specialties: [],
                prescriber: roleType === 'prescribing' ? 'yes' : 'no'
            }

            if (npi) {
                npiLookupResults.results.forEach(result => {
                    if (result.number === parseInt(npi)) {
                        provider.name = result.basic.name;
                        result.taxonomies.forEach(taxonomy => {
                            provider.specialties.push(taxonomy.desc)
                        })
                    }
                })
            }

            return provider
        }).filter((provider: Provider) => {
            if (provider.name) {
                return true;
            }

            return false;
        })
    }

    return (
        <div>
            <h2>Providers</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Specialties</TableCell>
                        <TableCell>Prescriber</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {providers.map((provider, index) => {
                        return (
                            <TableRow key={index}>
                                <TableCell>{provider.name}</TableCell>
                                <TableCell>{provider.specialties.join(', ')}</TableCell>
                                <TableCell>{provider.prescriber}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
}