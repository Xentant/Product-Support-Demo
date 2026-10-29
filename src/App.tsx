import { AskEvidencePanel } from './components/AskEvidence';
import { AppShell, Toasts } from './components/Shell';
import { Tour } from './components/Tour';
import { useHashRoute } from './lib/router';
import { DataModel } from './pages/DataModel';
import { DriverDetail } from './pages/DriverDetail';
import { Glossary } from './pages/Glossary';
import { Overview } from './pages/Overview';
import { ProductOutcomes } from './pages/ProductOutcomes';
import { SupportIntelligence } from './pages/SupportIntelligence';
import { TrustLab } from './pages/TrustLab';

export function App() {
  const [section, ...rest] = useHashRoute();
  let page;
  let active = section;
  switch (section) {
    case 'support':
      page = rest[0] === 'driver' && rest[1] ? <DriverDetail id={rest[1]} /> : <SupportIntelligence />;
      break;
    case 'trust-lab':
      page = <TrustLab scenarioId={rest[0]} />;
      break;
    case 'outcomes':
      page = <ProductOutcomes view={rest[0]} />;
      break;
    case 'glossary':
      page = <Glossary />;
      break;
    case 'data':
      page = <DataModel />;
      break;
    default:
      active = 'overview';
      page = <Overview />;
  }
  return (
    <>
      <AppShell active={active}>
        <div key={section + rest.join('/')} className="fade-in">{page}</div>
      </AppShell>
      <AskEvidencePanel />
      <Tour />
      <Toasts />
    </>
  );
}
