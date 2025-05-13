import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

const GameUploadForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('developer', data.developer);
      formData.append('tags', data.tags);
      formData.append('thumbnail', data.thumbnail[0]);
      formData.append('gameFile', data.gameFile[0]);
      
      const res = await axios.post('/api/admin/games/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('Game uploaded successfully!');
      router.push('/admin/games');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload game');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Upload New Game</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Game Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            rows="4"
            {...register('description', { required: 'Description is required' })}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Developer Name</label>
          <input
            type="text"
            {...register('developer', { required: 'Developer name is required' })}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.developer && <p className="text-red-500 text-sm mt-1">{errors.developer.message}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            {...register('tags')}
            placeholder="action, adventure, puzzle"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            {...register('thumbnail', { required: 'Thumbnail is required' })}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">Game File (HTML/JS/ZIP)</label>
          <input
            type="file"
            accept=".html,.js,.zip"
            {...register('gameFile', { required: 'Game file is required' })}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.gameFile && <p className="text-red-500 text-sm mt-1">{errors.gameFile.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Game'}
        </button>
      </form>
    </div>
  );
};

export default GameUploadForm;