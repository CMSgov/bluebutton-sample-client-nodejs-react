import { Table, TableCaption, TableRow, TableCell, TableHead, TableBody } from '@cmsgov/design-system';
import React, { useEffect, useState } from 'react';
import * as process from 'process';

export type InsuranceCardField = {
    label: string,
    value: string
}

export type ErrorResponse = {
    type: string,
    content: string,
}

export default function InsuranceCard() {
    const [fields, setFields] = useState<InsuranceCardField[]>([]);
    const [message, setMessage] = useState<ErrorResponse>();

    /*
    * DEVELOPER NOTES:
    * The $generate-digital-insurance-card operation returns a FHIR Bundle containing
    * CARIN Digital Insurance Card (C4DIC) resources (Patient, Coverage, Organization).
    * Here we pull out a few common fields for display purposes. You will want to
    * inspect the actual Bundle returned by your environment and adjust the parsing
    * to fit the fields your application needs.
    */
    useEffect(() => {
        const test_url = process.env.TEST_APP_API_URL ? process.env.TEST_APP_API_URL : '';
        fetch(`${test_url}/api/data/insurancecard`)
            .then(res => {
                return res.json();
            }).then(insuranceCardData => {
                if (insuranceCardData.entry) {
                    const coverageEntry = insuranceCardData.entry.find(
                        (e: any) => e.resource?.resourceType === 'Coverage'
                    );
                    const organizationEntry = insuranceCardData.entry.find(
                        (e: any) => e.resource?.resourceType === 'Organization'
                    );
                    const coverage = coverageEntry?.resource;
                    const organization = organizationEntry?.resource;

                    const cardFields: InsuranceCardField[] = [
                        { label: 'Payer', value: organization?.name || 'Unknown' },
                        { label: 'Member ID', value: coverage?.subscriberId || 'Unknown' },
                        { label: 'Plan', value: coverage?.class?.[0]?.name || 'Unknown' },
                        { label: 'Group Number', value: coverage?.class?.[0]?.value || 'Unknown' },
                    ];
                    setFields(cardFields);
                } else {
                    if (insuranceCardData.message) {
                        setMessage({ "type": "error", "content": insuranceCardData.message || "Unknown" })
                    }
                }
            });
    }, [])

    if (message) {
        return (
            <div className='full-width-card'>
                <Table className="ds-u-margin-top--2" stackable stackableBreakpoint="md">
                    <TableCaption>Error Response</TableCaption>
                    <TableHead>
                        <TableRow>
                            <TableCell id="ic_column_1">Type</TableCell>
                            <TableCell id="ic_column_2">Content</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell stackedTitle="Type" headers="ic_column_1">
                                {message.type}
                            </TableCell>
                            <TableCell stackedTitle="Content" headers="ic_column_2">
                                {message.content}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    } else {
        return (
            <div className='full-width-card'>
                <Table className="ds-u-margin-top--2" stackable stackableBreakpoint="md">
                    <TableCaption>Digital Insurance Card</TableCaption>
                    <TableHead>
                        <TableRow>
                            <TableCell id="ic_column_1">Field</TableCell>
                            <TableCell id="ic_column_2">Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map(field => {
                            return (
                                <TableRow key={field.label}>
                                    <TableCell stackedTitle="Field" headers="ic_column_1">
                                        {field.label}
                                    </TableCell>
                                    <TableCell stackedTitle="Value" headers="ic_column_2">
                                        {field.value}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }
}
