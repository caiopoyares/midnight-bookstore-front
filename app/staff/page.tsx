import { StaffDesk } from '../../components/staff-desk';
export const metadata = {
  title: 'Painel da livraria',
  robots: { index: false, follow: false },
};
export default function StaffPage() {
  return (
    <div className="shell page">
      <h1>Painel da livraria</h1>
      <StaffDesk />
    </div>
  );
}
