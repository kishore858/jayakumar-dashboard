
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Entry } from '@/lib/types';
import { isValidUrl, generatePassword, debounce, getFaviconUrl, extractDomain } from '@/lib/utils';
import { ArrowLeft, Loader2, RefreshCw, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import LogoFetcher from '@/components/LogoFetcher';
import api from '@/lib/api';

const emptyEntry: Omit<Entry, '_id' | 'serialNumber' | 'createdAt' | 'updatedAt'> = {
  name: '',
  username: '',
  password: '',
  website: '',
  logo: '',
};

const AddEditEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [entry, setEntry] = useState<Omit<Entry, '_id' | 'serialNumber' | 'createdAt' | 'updatedAt'>>(emptyEntry);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
    }
  }, [user, navigate]);
  
  // Fetch entry details if in edit mode
  useEffect(() => {
    const fetchEntry = async () => {
      if (!isEditMode || !id) return;
      
      setLoading(true);
      
      try {
        const data = await api.entries.getById(id);
        
        // Extract the necessary fields
        const { name, username, password, website, logo } = data;
        setEntry({ name, username, password, website, logo });
        setLogoUrl(logo);
      } catch (err) {
        console.error('Error fetching entry:', err);
        toast({
          title: "Error",
          description: "Failed to load entry details",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntry();
  }, [id, isEditMode, navigate]);
  
  // Update logo URL when website changes
  useEffect(() => {
    if (!entry.website) {
      setLogoUrl('');
      return;
    }
    
    try {
      const domain = extractDomain(entry.website);
      setLogoUrl(getFaviconUrl(domain));
    } catch (err) {
      console.error('Error setting logo URL:', err);
      setLogoUrl('');
    }
  }, [entry.website]);
  
  // Check if username is unique for website
  const checkUsernameUnique = debounce(async (username: string, website: string) => {
    if (!username || !website) return;
    
    setCheckingUsername(true);
    
    try {
      const exists = await api.entries.checkUsername(username, website);
      
      if (exists && !isEditMode) {
        setErrors(prev => ({
          ...prev,
          username: `Username already exists for ${website}`,
        }));
      } else {
        setErrors(prev => ({ ...prev, username: '' }));
      }
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setCheckingUsername(false);
    }
  }, 500);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setEntry(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check username uniqueness if username or website changes
    if ((name === 'username' || name === 'website') && entry.username && entry.website) {
      checkUsernameUnique(
        name === 'username' ? value : entry.username,
        name === 'website' ? value : entry.website
      );
    }
  };
  
  // Generate random password
  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setEntry(prev => ({ ...prev, password: newPassword }));
    setShowPassword(true);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!entry.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!entry.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    
    if (!entry.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    if (!entry.website.trim()) {
      newErrors.website = 'Website is required';
      isValid = false;
    } else if (!isValidUrl(entry.website)) {
      newErrors.website = 'Please enter a valid website URL';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // Always add the logo based on the website
      const domain = extractDomain(entry.website);
      const entryWithLogo = {
        ...entry,
        logo: getFaviconUrl(domain),
      };
      
      if (isEditMode && id) {
        await api.entries.update(id, entryWithLogo);
        toast({
          title: "Success",
          description: "Entry updated successfully",
        });
      } else {
        await api.entries.create(entryWithLogo);
        toast({
          title: "Success",
          description: "New entry created successfully",
        });
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving entry:', err);
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (!user) {
    return null; // Will redirect from useEffect
  }
  
  return (
    <Layout>
      <div className="page-container py-8">
        <div className="page-header mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Entry' : 'Add New Entry'}
          </h1>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading entry details...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="card-container">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {logoUrl && <LogoFetcher website={entry.website} size={32} />}
                  {isEditMode ? 'Edit Entry Details' : 'Create New Entry'}
                </CardTitle>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Account Name"
                      value={entry.name}
                      onChange={handleChange}
                      className="input-field"
                    />
                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        name="website"
                        placeholder="example.com"
                        value={entry.website}
                        onChange={handleChange}
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.website && <p className="text-destructive text-sm">{errors.website}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Input
                        id="username"
                        name="username"
                        placeholder="Username or Email"
                        value={entry.username}
                        onChange={handleChange}
                        className="input-field"
                      />
                      {checkingUsername && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                      )}
                    </div>
                    {errors.username && <p className="text-destructive text-sm">{errors.username}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={entry.password}
                          onChange={handleChange}
                          className="input-field pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGeneratePassword}
                        className="shrink-0"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                    {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Entry' : 'Create Entry'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddEditEntry;
