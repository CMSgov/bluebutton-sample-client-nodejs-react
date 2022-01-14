import { Table, TableCaption, TableRow, TableCell, TableHead, TableBody } from '@cmsgov/design-system';
import { useEffect, useState } from 'react';

export type EOBRecord = {
    id: string,
    code: string,
    display: string,
    amount: number
}

export type PatientRecord = {
    id: string,
    name: string,
    gender: string,
    dateOfBirth: string,
    addressState: string,
    addressZip: string
}

export type CoverageRecord = {
    id: string,
    subscriberId: string,
    status: string,
    beneRef: string,
    payor: string
}

export type ErrorResponse = {
    type: string,
    content: string,
}

export default function Records() {
    const [eobs, setRecords] = useState<EOBRecord[]>([]);
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [coverages, setCoverages] = useState<CoverageRecord[]>([]);
    const [message, setMessage] = useState<ErrorResponse>();
    /*
    * DEVELOPER NOTES:
    *  Here we are parsing through the different PDE Claim records
    * for the user/beneficiary.  We have hard coded certain pieces of this data. (ie...item[0])
    * You will want to find a method of parsing the FHIR JSON response to get the data
    * you need for your application.  Don't forget to use a 'Discriminator' to determine
    * which item within a list you want to get data from.
    * 
    * ie.  You are interested in getting all Prescription Drug NDC codes you would use the following criteria/discriminator
    * resource.item[N].coding[N].code WHERE resource.item[N].coding[N].system = "http://hl7.org/fhir/sid/ndc"
    * 
    * 
    * *NOTE* 
    * There are multiple claim types within the BB2 Sandbox, not just PDE (Part-D Events - Drug/Medication Claims).  There are also
    * Carrier Claims, SNF, HHA, Hospice, Inpatient, and Outpatient
    */
    useEffect(() => {
        fetch('/api/data/benefit')
            .then(res => {
                return res.json();
            }).then(beneData => {
                if (beneData.eobData && beneData.eobData.entry) {
                    const records: EOBRecord[] = beneData.eobData.entry.map((resourceData: any) => {
                        const resource = resourceData.resource;
                        return {
                            id: resource.id,
                            code: resource.item[0]?.productOrService?.coding[0]?.code || 'Unknown',
                            display: resource.item[0]?.productOrService?.coding[0]?.display || 'Unknown Prescription Drug',
                            amount: resource.item[0]?.adjudication[7]?.amount?.value || '0'
                        }
                    });
                    setRecords(records);
                }
                
                if (beneData.patient && beneData.patient.entry) {
                    const records: PatientRecord[] = beneData.patient.entry.map((resourceData: any) => {
                        const resource = resourceData.resource;
                        return {
                            id: resource.id,
                            name: resource?.name[0]?.family || 'Unknown',
                            gender: resource?.gender || 'Unknown Gender',
                            dateOfBirth: resource?.birthDate || 'Unknown DOB',
                            addressState: resource?.address[0]?.state || 'Unknown State',
                            addressZip: resource?.address[0]?.postalCode || 'Unknown ZIP',
                        }
                    });
                    setPatients(records);
                }

                if (beneData.coverage && beneData.coverage.entry) {
                    const records: CoverageRecord[] = beneData.coverage.entry.map((resourceData: any) => {
                        const resource = resourceData.resource;
                        return {
                            id: resource.id,
                            subscriberId: resource?.subscriberId || 'Unknown',
                            status: resource?.status || 'Unknown Status',
                            beneRef: resource?.beneficiary?.reference || 'Unknown Beneficiary',
                            payor: resource?.payor[0]?.identifier?.value || 'Unknown Payor',
                        }
                    });
                    setCoverages(records);
                }

                if (beneData.eobData && beneData.eobData.message) {
                    setMessage({"type": "error", "content": beneData.eobData.message || "Unknown"})
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
                            <TableCell id="column_1">Type</TableCell>
                            <TableCell id="column_2">Content</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell stackedTitle="Type" headers="column_1">
                                {message.type}
                            </TableCell>
                            <TableCell stackedTitle="Content" headers="column_2">
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
            <div className='full-width-card'>
                <Table className="ds-u-margin-top--2" stackable stackableBreakpoint="md">
                    <TableCaption>Medicare Patient Info</TableCaption>
                    <TableHead>
                        <TableRow>
                            <TableCell id="column_1">Name</TableCell>
                            <TableCell id="column_2">Gender</TableCell>
                            <TableCell id="column_3">Birth Date</TableCell>
                            <TableCell id="column_4">Address State</TableCell>
                            <TableCell id="column_5">Address ZIP</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.map(record => {
                            return (
                                <TableRow key={record.id}>
                                    <TableCell stackedTitle="Name" headers="column_1">
                                        {record.name}
                                    </TableCell>
                                    <TableCell stackedTitle="Gender" headers="column_2">
                                        {record.gender}
                                    </TableCell>
                                    <TableCell stackedTitle="Birth Date" headers="column_3">
                                        {record.dateOfBirth}
                                    </TableCell>
                                    <TableCell stackedTitle="Address State" headers="column_4">
                                        {record.addressState}
                                    </TableCell>
                                    <TableCell stackedTitle="Address ZIP" headers="column_5">
                                        {record.addressZip}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <div className='full-width-card'>
                <Table className="ds-u-margin-top--2" stackable stackableBreakpoint="md">
                    <TableCaption>Medicare Coverage Info</TableCaption>
                    <TableHead>
                        <TableRow>
                            <TableCell id="column_1">Subscriber ID</TableCell>
                            <TableCell id="column_2">Status</TableCell>
                            <TableCell id="column_3">Beneficiary Reference</TableCell>
                            <TableCell id="column_4">Payor</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {coverages.map(record => {
                            return (
                                <TableRow key={record.id}>
                                    <TableCell stackedTitle="Subscriber ID" headers="column_1">
                                        {record.subscriberId}
                                    </TableCell>
                                    <TableCell stackedTitle="Status" headers="column_2">
                                        {record.status}
                                    </TableCell>
                                    <TableCell stackedTitle="Beneficiary Reference" headers="column_3">
                                        {record.beneRef}
                                    </TableCell>
                                    <TableCell stackedTitle="Payor" headers="column_4">
                                        {record.payor}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <div className='full-width-card'>
                <Table className="ds-u-margin-top--2" stackable stackableBreakpoint="md">
                    <TableCaption>Medicare Prescription Drug Claims Data</TableCaption>
                    <TableHead>
                        <TableRow>
                            <TableCell id="column_1">NDC Code</TableCell>
                            <TableCell id="column_2">Prescription Drug Name</TableCell>
                            <TableCell id="column_3">Cost</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {eobs.map(record => {
                            return (
                                <TableRow key={record.id}>
                                    <TableCell stackedTitle="NDC Code" headers="column_1">
                                        {record.code}
                                    </TableCell>
                                    <TableCell stackedTitle="Prescription Drug Name" headers="column_2">
                                        {record.display}
                                    </TableCell>
                                    <TableCell stackedTitle="Cost" headers="column_3">
                                        ${record.amount}.00
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
    }
};