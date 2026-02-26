import React, { useState, useEffect } from 'react';
import { User, Mail, LogOut, Save, Loader2, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

export default function Profile() {
  const { user, setSession } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', user!.id)
        .single();

      if (error) {
         // If no profile found, try to insert one
         if (error.code === 'PGRST116') {
             const { error: insertError } = await supabase
             .from('users')
             .insert([{ id: user!.id, email: user!.email!, name: user!.email!.split('@')[0], password_hash: 'managed_by_supabase' }]);
             
             if (!insertError) {
                 setName(user!.email!.split('@')[0]);
                 return;
             }
         }
         throw error;
      }
      if (data) setName(data.name);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user!.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Guest Profile</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">Welcome, Guest!</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              You are currently using the app in Guest Mode. Your vocabulary and progress are saved locally on this device.
            </p>
            <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
              To sync your data across devices and ensure your data is safe, please log in or create an account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Profile Details</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">Sign out of your account</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
        </div>
      </div>
    </div>
  );
}
