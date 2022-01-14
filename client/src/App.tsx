import Header from './components/header';
import Records from './components/records';
import { Routes, Route } from "react-router-dom";
import { TabPanel, Tabs } from '@cmsgov/design-system';
import { Layout } from './components/layout';
import Profile from './components/profile';
import Medications from './components/medications';
import Procedures from './components/procedures';
import Providers from './components/providers';
import Expenses from './components/expenses';
import Diagnoses from './components/diagnoses';

function App() {
  return (
    <div className="ds-l-container ds-u-margin-bottom--7 ds-u-padding-bottom--7">
      <Header />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Profile />} />
          <Route path="medications" element={<Medications />} />
          <Route path="diagnoses" element={<Diagnoses />} />
          <Route path="procedures" element={<Procedures />} />
          <Route path="providers" element={<Providers />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="*" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
