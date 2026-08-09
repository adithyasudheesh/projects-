import { MotionConfig } from 'framer-motion';
import { LabProvider, useLab } from './context/LabContext';
import LabPage from './components/LabPage';
import ChallengePage from './components/ChallengePage';
import LabReportModal from './components/LabReportModal';

function AppShell() {
  const { page } = useLab();
  return (
    <>
      {page === 'lab' ? <LabPage /> : <ChallengePage />}
      <LabReportModal />
    </>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LabProvider>
        <AppShell />
      </LabProvider>
    </MotionConfig>
  );
}

export default App;
