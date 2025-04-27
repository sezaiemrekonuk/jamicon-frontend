import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/types/user';
import { userApi } from '@/lib/api/user';
import { toast } from 'sonner';
import { useAuth } from '@/lib/providers/auth-provider';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Accepted file types
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface AvatarUploadProps {
  user: User;
  onAvatarUpdated: (user: User) => void;
}

export function AvatarUpload({ user, onAvatarUpdated }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { updateUserInfo } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    
    return () => clearInterval(interval);
  };

  const validateFile = (file: File): string | null => {
    if (!file) return 'No file selected';
    
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported. Please upload JPEG, PNG, GIF, or WebP.';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
    }
    
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const error = validateFile(file);
    
    if (error) {
      toast.error(error);
      setUploadError(error);
      return;
    }
    
    setUploadError(null);
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setIsModalOpen(true);
    
    // Clean up input value to allow selecting the same file again
    event.target.value = '';
    
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;
    
    setIsUploading(true);
    const cleanup = simulateProgress();
    
    try {
      const updatedUser = await userApi.uploadAvatar(user.id, selectedFile);
      setUploadProgress(100);
      
      // Small delay to show 100% before closing
      setTimeout(() => {
        onAvatarUpdated(updatedUser);
        // Update user info in auth provider to reflect changes across the app
        updateUserInfo({ avatarUrl: updatedUser.avatarUrl });
        closeModal();
        toast.success('Avatar updated successfully');
      }, 500);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError('Failed to upload avatar. Please try again later.');
      toast.error('Failed to upload avatar');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        clearTimeout(cleanup as unknown as number);
      }, 500);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  return (
    <>
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={user?.avatarUrl || ''} alt={user?.username || 'User'} />
          <AvatarFallback className="text-xl">{(user?.username || 'U').charAt(0)}</AvatarFallback>
        </Avatar>
        
        <button 
          onClick={openFileSelector}
          className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    shadow-sm hover:shadow-md"
          title="Upload new avatar"
        >
          <Upload className="h-4 w-4" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Avatar</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-5 py-4">
            {previewUrl ? (
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={previewUrl} alt="Preview" />
                  <AvatarFallback>
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                
                {!isUploading && (
                  <button 
                    onClick={() => setPreviewUrl(null)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div 
                onClick={openFileSelector}
                className="h-32 w-32 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            
            {uploadError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            
            {isUploading && (
              <div className="w-full space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={closeModal} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!previewUrl || isUploading}
              className="gap-1"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
              {!isUploading && <Check className="h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 