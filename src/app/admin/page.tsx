import { redirect } from 'next/navigation';

export default function DeprecatedAdmin() {
  redirect('/dashboard');
}
