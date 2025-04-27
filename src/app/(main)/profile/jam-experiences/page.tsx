"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userProfileApi } from '@/lib/api/userProfile';
import { JamExperience, JamExperienceFormData } from '@/types/user';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function JamExperiencesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jamExperiences, setJamExperiences] = useState<JamExperience[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JamExperienceFormData>();
  
  useEffect(() => {
    fetchJamExperiences();
  }, []);
  
  const fetchJamExperiences = async () => {
    try {
      setIsLoading(true);
      const experiences = await userProfileApi.getUserJamExperiences();
      setJamExperiences(experiences);
    } catch (error) {
      console.error('Failed to load jam experiences', error);
      toast.error('Failed to load jam experiences');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: JamExperienceFormData) => {
    try {
      setIsLoading(true);
      
      if (editingId) {
        // Update existing experience
        await userProfileApi.updateJamExperience(editingId, data);
        toast.success('Jam experience updated successfully');
      } else {
        // Add new experience
        await userProfileApi.createJamExperience(data);
        toast.success('Jam experience added successfully');
      }
      
      // Reset form and state
      reset();
      setIsAdding(false);
      setEditingId(null);
      
      // Refresh the list
      await fetchJamExperiences();
    } catch (error) {
      console.error('Failed to save jam experience', error);
      toast.error('Failed to save jam experience');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (experience: JamExperience) => {
    setEditingId(experience.id);
    setValue('jamName', experience.jamName);
    setValue('jamUrl', experience.jamUrl);
    setValue('position', experience.position);
    setValue('description', experience.description);
    setValue('entryDate', new Date(experience.entryDate) as any);
    setIsAdding(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this jam experience?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await userProfileApi.deleteJamExperience(id);
      toast.success('Jam experience deleted successfully');
      await fetchJamExperiences();
    } catch (error) {
      console.error('Failed to delete jam experience', error);
      toast.error('Failed to delete jam experience');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Jam Experiences</h1>
            <Button onClick={() => router.back()} variant="outline">
              Back to Profile
            </Button>
          </div>
          
          {isAdding ? (
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Edit' : 'Add'} Jam Experience</CardTitle>
                <CardDescription>
                  {editingId ? 'Update your jam experience details' : 'Add a new jam that you participated in'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jamName">Jam Name</Label>
                      <Input 
                        id="jamName" 
                        {...register('jamName', { required: 'Jam name is required' })} 
                        placeholder="e.g. Global Game Jam 2023"
                      />
                      {errors.jamName && <p className="text-red-500 text-sm">{errors.jamName.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jamUrl">Jam URL</Label>
                      <Input 
                        id="jamUrl" 
                        {...register('jamUrl', { required: 'Jam URL is required' })} 
                        placeholder="https://example.com/jam"
                      />
                      {errors.jamUrl && <p className="text-red-500 text-sm">{errors.jamUrl.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input 
                        id="position" 
                        type="number" 
                        {...register('position', { 
                          required: 'Position is required',
                          valueAsNumber: true,
                          min: { value: 1, message: 'Position must be at least 1' }
                        })} 
                        placeholder="1"
                      />
                      {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="entryDate">Entry Date</Label>
                      <Input 
                        id="entryDate" 
                        type="date" 
                        {...register('entryDate', { required: 'Entry date is required' })} 
                      />
                      {errors.entryDate && <p className="text-red-500 text-sm">{errors.entryDate.message}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      {...register('description')} 
                      rows={4}
                      placeholder="Describe your role and achievements in this jam..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAdding(false);
                        setEditingId(null);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {editingId ? 'Update' : 'Add'} Experience
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              <Button onClick={() => setIsAdding(true)} className="mb-6">
                Add New Jam Experience
              </Button>
              
              {isLoading && jamExperiences.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p>Loading jam experiences...</p>
                </div>
              ) : jamExperiences.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-64">
                    <p className="text-gray-500 mb-4">You haven't added any jam experiences yet.</p>
                    <Button onClick={() => setIsAdding(true)}>Add Your First Experience</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {jamExperiences.map((experience) => (
                    <Card key={experience.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div>
                            <h3 className="text-xl font-bold">{experience.jamName}</h3>
                            <p className="text-gray-500">
                              {new Date(experience.entryDate).toLocaleDateString()}
                            </p>
                            {experience.description && (
                              <p className="mt-2">{experience.description}</p>
                            )}
                            <div className="mt-2">
                              <a
                                href={experience.jamUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Jam
                              </a>
                            </div>
                          </div>
                          <div className="flex gap-2 md:self-start">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(experience)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(experience.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 