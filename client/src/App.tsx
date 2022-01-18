import Header from './components/header';
import { Routes, Route } from "react-router-dom";
import { Layout } from './components/layout';
import Profile from './components/profile';
import Medications from './components/medications';
import Procedures from './components/procedures';
import Providers from './components/providers';
import Expenses from './components/expenses';
import Diagnoses from './components/diagnoses';
import { useState, useEffect } from 'react';

export type AllMedicaidClaimsData = {
  eobData?: any
}

function App() {
  const [records, setRecords] = useState<AllMedicaidClaimsData>({});

  useEffect(() => {
    fetch('/api/data/benefit')
      .then(res => {
        return res.json();
      }).then(eobData => {
        setRecords({ eobData });
      });
  }, [])
  return (
    <div className="ds-l-container ds-u-margin-bottom--7 ds-u-padding-bottom--7">
      <Header />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Profile eobData={records.eobData} />} />
          <Route path="medications" element={<Medications />} />
          <Route path="diagnoses" element={<Diagnoses />} />
          <Route path="procedures" element={<Procedures />} />
          <Route path="providers" element={<Providers eobData={records.eobData} />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="*" element={<Profile eobData={records.eobData} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
