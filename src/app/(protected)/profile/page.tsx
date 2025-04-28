"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, UserProfile } from '@/types/user';
import { userProfileApi } from '@/lib/api/userProfile';
import { userApi } from '@/lib/api/user';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Github, Twitter, Globe, Youtube, Twitch, MessageSquare, Phone, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AvatarUpload } from '@/components/avatar-upload';
import { useAuth } from '@/lib/providers/auth-provider';
export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  
  const { user: authUser } = useAuth();

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        // Fetch current user data
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        
        // Fetch profile data
        const profile = await userProfileApi.getCurrentUserProfile();
        setUserProfile(profile);
        
        reset({
          name: profile.name,
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone,
          website: profile.website,
          github: profile.github,
          twitter: profile.twitter,
          youtube: profile.youtube,
          twitch: profile.twitch,
          discord: profile.discord
        });
      } catch (error) {
        console.error('Failed to load profile', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [reset]);
  
  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const updatedProfile = await userProfileApi.updateUserProfile(data);
      setUserProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };
  
  const onPasswordSubmit = async (data: any) => {
    try {
      setIsPasswordLoading(true);
      await userApi.updatePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully');
      
      // Reset the password form after successful submission
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Failed to update password', error);
      
      // Handle specific error cases
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || 'Unknown error occurred';
        
        if (status === 401) {
          // Current password is incorrect
          toast.error('Current password is incorrect');
          passwordForm.setError('currentPassword', {
            type: 'manual',
            message: 'Current password is incorrect'
          });
        } else if (status === 400) {
          // New password is the same as the old one or doesn't meet requirements
          toast.error(errorMessage);
          if (errorMessage.includes('same as')) {
            passwordForm.setError('newPassword', {
              type: 'manual',
              message: 'New password must be different from your current password'
            });
          }
        } else {
          // Other server-side errors
          toast.error(`Failed to update password: ${errorMessage}`);
        }
      } else if (error.request) {
        // Network error - no response received
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened while setting up the request
        toast.error('Failed to update password. Please try again later.');
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading && !userProfile) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto max-w-4xl">
        <div className="mx-auto px-4 py-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your personal information and jam experiences
              </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="jam-experiences">Jam Experiences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-6">
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile sidebar */}
                    <Card className="md:col-span-1">
                      <CardHeader className="flex flex-col items-center space-y-4">
                        {user ? (
                          <AvatarUpload user={user} onAvatarUpdated={handleAvatarUpdated} />
                        ) : (
                          <Avatar className="h-24 w-24">
                            {authUser?.avatarUrl && (
                              <AvatarImage src={authUser.avatarUrl} alt="Profile" />
                            )}
                            <AvatarFallback className="text-xl">{(userProfile?.name?.charAt(0) || authUser?.username?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="space-y-1 text-center">
                          <CardTitle>{authUser?.username || 'Username'}</CardTitle>
                          {(userProfile?.location || true) && (
                            <CardDescription className="flex items-center justify-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {userProfile?.location || 'Add your location'}
                            </CardDescription>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(userProfile?.bio || true) && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
                            <p className="text-sm">{userProfile?.bio || 'Add a short bio to tell others about yourself'}</p>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{userProfile?.phone || 'Add your phone number'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {userProfile?.website ? (
                              <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {userProfile.website.replace(/^https?:\/\//, '')}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Add your website</span>
                            )}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Social</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            {userProfile?.github ? (
                              <a href={`https://github.com/${userProfile.github}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {userProfile.github}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Add your GitHub username</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                            {userProfile?.twitter ? (
                              <a href={`https://twitter.com/${userProfile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {userProfile.twitter}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Add your Twitter username</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span>{userProfile?.discord || 'Add your Discord username'}</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Content Platforms</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Youtube className="h-4 w-4 text-muted-foreground" />
                            {userProfile?.youtube ? (
                              <a href={`https://youtube.com/${userProfile.youtube}`} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
                                {userProfile.youtube}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Add your YouTube channel</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Twitch className="h-4 w-4 text-muted-foreground" />
                            {userProfile?.twitch ? (
                              <a href={`https://twitch.tv/${userProfile.twitch}`} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                                {userProfile.twitch}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">Add your Twitch username</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={() => setIsEditing(true)} className="w-full">
                          Edit Profile
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {/* Main content */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Jam Experiences</CardTitle>
                        <CardDescription>
                          Showcase your game jam history and achievements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {userProfile?.jamExperiences?.length ? (
                          <div className="space-y-4">
                            {userProfile.jamExperiences.slice(0, 3).map((experience) => (
                              <div key={experience.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{experience.jamName}</h4>
                                      <Badge variant="outline">#{experience.position}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(experience.entryDate).toLocaleDateString()}
                                    </p>
                                    {experience.description && (
                                      <p className="mt-2 text-sm">{experience.description}</p>
                                    )}
                                  </div>
                                  <a
                                    href={experience.jamUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm"
                                  >
                                    View Entry
                                  </a>
                                </div>
                              </div>
                            ))}
                            
                            {userProfile.jamExperiences.length > 3 && (
                              <div className="text-center mt-4">
                                <Button variant="outline" asChild>
                                  <Link href="/profile/jam-experiences">
                                    View All ({userProfile.jamExperiences.length})
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="border border-dashed rounded-lg p-4 hover:border-primary transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-muted-foreground">Your Game Jam Entry</h4>
                                    <Badge variant="outline" className="text-muted-foreground">Placement</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    Date of participation
                                  </p>
                                  <p className="mt-2 text-sm text-muted-foreground">Add details about your game and experience</p>
                                </div>
                                <span className="text-primary text-sm">Link to entry</span>
                              </div>
                            </div>
                            
                            <div className="text-center py-4">
                              <p className="text-muted-foreground mb-4">You haven't added any jam experiences yet.</p>
                              <Button variant="outline" asChild>
                                <Link href="/profile/jam-experiences">
                                  Add Your First Experience
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button variant="outline" asChild>
                          <Link href="/profile/jam-experiences">
                            Manage Jam Experiences
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Profile</CardTitle>
                      <CardDescription>
                        Update your personal information
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input id="name" {...register('name')} />
                              {errors.name && <p className="text-destructive text-sm">{errors.name.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input id="location" {...register('location')} />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" {...register('bio')} rows={4} />
                          </div>
                          
                          <Separator className="my-4" />
                          <h3 className="text-lg font-medium">Contact Information</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input id="phone" {...register('phone')} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="website">Website</Label>
                              <Input id="website" {...register('website')} />
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          <h3 className="text-lg font-medium">Social Links</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="github" className="flex items-center gap-2">
                                <Github className="h-4 w-4" /> GitHub Username
                              </Label>
                              <Input id="github" {...register('github')} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="twitter" className="flex items-center gap-2">
                                <Twitter className="h-4 w-4" /> Twitter Username
                              </Label>
                              <Input id="twitter" {...register('twitter')} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="youtube" className="flex items-center gap-2">
                                <Youtube className="h-4 w-4" /> YouTube Username
                              </Label>
                              <Input id="youtube" {...register('youtube')} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="twitch" className="flex items-center gap-2">
                                <Twitch className="h-4 w-4" /> Twitch Username
                              </Label>
                              <Input id="twitch" {...register('twitch')} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="discord" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Discord Username
                              </Label>
                              <Input id="discord" {...register('discord')} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-4 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                          <Button type="submit" disabled={isLoading}>Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message as string}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          {...passwordForm.register('newPassword', { 
                            required: 'New password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters'
                            },
                            validate: {
                              hasUpperCase: (value) => 
                                /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
                              hasLowerCase: (value) => 
                                /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
                              hasNumber: (value) => 
                                /[0-9]/.test(value) || 'Password must contain at least one number',
                              hasSpecialChar: (value) => 
                                /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Password must contain at least one special character'
                            }
                          })}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message as string}</p>
                        )}
                        
                        <div className="text-xs text-muted-foreground mt-1 space-y-1">
                          <p>Password requirements:</p>
                          <ul className="list-disc list-inside space-y-1 pl-2">
                            <li className={passwordForm.watch('newPassword')?.length >= 8 ? 'text-green-500' : ''}>
                              At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(passwordForm.watch('newPassword') || '') ? 'text-green-500' : ''}>
                              At least one uppercase letter
                            </li>
                            <li className={/[a-z]/.test(passwordForm.watch('newPassword') || '') ? 'text-green-500' : ''}>
                              At least one lowercase letter
                            </li>
                            <li className={/[0-9]/.test(passwordForm.watch('newPassword') || '') ? 'text-green-500' : ''}>
                              At least one number
                            </li>
                            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.watch('newPassword') || '') ? 'text-green-500' : ''}>
                              At least one special character
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...passwordForm.register('confirmPassword', { 
                            required: 'Please confirm your password',
                            validate: (value, formValues) => 
                              value === formValues.newPassword || 
                              'Passwords do not match'
                          })}
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message as string}</p>
                        )}
                      </div>
                      
                      <Button type="submit" disabled={isPasswordLoading}>
                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="jam-experiences">
                <Card>
                  <CardHeader>
                    <CardTitle>Jam Experiences</CardTitle>
                    <CardDescription>
                      Manage and showcase your game jam history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Button variant="outline" asChild>
                        <Link href="/profile/jam-experiences">
                          Manage Jam Experiences
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 