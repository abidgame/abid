import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/actions/authActions';
import Layout from '../components/Layout';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
    
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);
    }
  }, [isAuthenticated, router, user, setValue]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    
    dispatch(updateProfile(formData));
  };

  if (!isAuthenticated || !user) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Profile
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your account information and preferences.
            </p>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Activity
              </button>
            </nav>
          </div>
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Photo
                    </label>
                    <div className="mt-2 flex items-center space-x-5">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                        {photoPreview ? (
                          <Image
                            src={photoPreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                          />
                        ) : user.photo ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.photo}`}
                            alt={user.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <svg
                            className="h-full w-full text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <label
                        htmlFor="photo"
                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Change
                      </label>
                    </div>
                  </div>
                  
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('username', {
                          required: 'Username is required',
                          minLength: {
                            value: 3,
                            message: 'Username must be at least 3 characters',
                          },
                          maxLength: {
                            value: 20,
                            message: 'Username must be less than 20 characters',
                          },
                        })}
                        type="text"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.username.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        type="email"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Change Password
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Update your password to keep your account secure.
                </p>
              </div>
              <form className="mt-5 sm:flex sm:items-center">
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="current-password" className="sr-only">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="current-password"
                    id="current-password"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md mb-3"
                    placeholder="Current Password"
                  />
                  <label htmlFor="new-password" className="sr-only">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new-password"
                    id="new-password"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md mb-3"
                    placeholder="New Password"
                  />
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Confirm Password"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Change Password
                </button>
              </form>
            </div>
          )}
          
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Recent Activity
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  View your recent game activity and interactions.
                </p>
              </div>
              <div className="mt-5">
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <svg
                              className="h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Played <a href="#" className="font-medium text-gray-900">Space Adventure</a>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime="2023-01-23">Today</time>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <svg
                              className="h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Rated <a href="#" className="font-medium text-gray-900">Puzzle Master</a> with 4 stars
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime="2023-01-22">Yesterday</time>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 