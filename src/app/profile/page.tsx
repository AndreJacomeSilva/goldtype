import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import ProfileForm from './profileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">O meu perfil</h1>
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <ProfileForm initialUser={user} />
        </div>
      </div>
    </div>
  );
}
