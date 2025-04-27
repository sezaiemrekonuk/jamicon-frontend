import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvatarUpload } from './avatar-upload';
import { userApi } from '@/lib/api/user';
import { toast } from 'sonner';

// Mock the dependencies
jest.mock('@/lib/api/user', () => ({
  userApi: {
    uploadAvatar: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Create a sample user for testing
const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  username: 'testuser',
  avatarUrl: 'http://example.com/avatar.jpg',
  emailVerified: true,
  role: 'USER',
};

describe('AvatarUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the avatar with user image', () => {
    render(<AvatarUpload user={mockUser} onAvatarUpdated={() => {}} />);
    const avatarImage = screen.getByAltText('testuser');
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('src', 'http://example.com/avatar.jpg');
  });

  it('shows upload button on hover', async () => {
    const { container } = render(
      <AvatarUpload user={mockUser} onAvatarUpdated={() => {}} />
    );
    
    // Find the upload button (it should be present in the DOM but visually hidden)
    const uploadButton = container.querySelector('button[title="Upload new avatar"]');
    expect(uploadButton).toBeInTheDocument();
  });

  it('validates file size', async () => {
    render(<AvatarUpload user={mockUser} onAvatarUpdated={() => {}} />);
    
    // Mock file that exceeds size limit
    const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    // Get the hidden file input
    const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('File is too large'));
    });
  });

  it('validates file type', async () => {
    render(<AvatarUpload user={mockUser} onAvatarUpdated={() => {}} />);
    
    // Mock invalid file type
    const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    
    // Get the hidden file input
    const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('File type not supported'));
    });
  });

  it('handles successful avatar upload', async () => {
    // Mock successful upload
    const updatedUser = { ...mockUser, avatarUrl: 'http://example.com/new-avatar.jpg' };
    (userApi.uploadAvatar as jest.Mock).mockResolvedValue(updatedUser);
    
    const onAvatarUpdated = jest.fn();
    render(<AvatarUpload user={mockUser} onAvatarUpdated={onAvatarUpdated} />);
    
    // Mock valid file
    const validFile = new File(['image content'], 'avatar.jpg', { type: 'image/jpeg' });
    
    // Get the hidden file input
    const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    // Dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Upload Avatar')).toBeInTheDocument();
    });
    
    // Click upload button
    fireEvent.click(screen.getByText('Upload'));
    
    // Mock should have been called with correct params
    expect(userApi.uploadAvatar).toHaveBeenCalledWith(mockUser.id, validFile);
    
    // Wait for success
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Avatar updated successfully');
      expect(onAvatarUpdated).toHaveBeenCalledWith(updatedUser);
    });
  });

  it('handles upload errors', async () => {
    // Mock failed upload
    (userApi.uploadAvatar as jest.Mock).mockRejectedValue(new Error('Upload failed'));
    
    render(<AvatarUpload user={mockUser} onAvatarUpdated={() => {}} />);
    
    // Mock valid file
    const validFile = new File(['image content'], 'avatar.jpg', { type: 'image/jpeg' });
    
    // Get the hidden file input
    const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    // Click upload button
    await waitFor(() => {
      fireEvent.click(screen.getByText('Upload'));
    });
    
    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to upload avatar');
    });
  });
}); 