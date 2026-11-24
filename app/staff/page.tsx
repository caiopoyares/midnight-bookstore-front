import { StaffDesk } from '../../components/staff-desk';
export const metadata = {
  title: 'Staff desk',
  robots: { index: false, follow: false },
};
export default function StaffPage() {
  return (
    <div className="shell page">
      <h1>Staff desk</h1>
      <StaffDesk />
    </div>
  );
}
