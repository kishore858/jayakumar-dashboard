
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isValidEmail } from '@/lib/utils';
import { Lock, Mail, User, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const Auth: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    form: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      setCheckingAdmin(true);
      try {
        const exists = await api.auth.checkAdmin();
        setAdminExists(exists);
      } catch (error) {
        console.error('Error checking admin:', error);
        setAdminExists(false); // Assume no admin if error
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ mode: value });
    setErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      form: '',
    });
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      form: '',
    };
    
    let isValid = true;
    
    // Validate name in signup mode
    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Validate password confirmation in signup mode
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors((prev) => ({ ...prev, form: '' }));
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      setErrors((prev) => ({ 
        ...prev, 
        form: error instanceof Error ? error.message : 'Authentication failed' 
      }));
    } finally {
      setLoading(false);
    }
  };
  
  if (checkingAdmin) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Checking system status...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">
              {!adminExists 
                ? 'Create Admin Account' 
                : mode === 'login' 
                  ? 'Log In to Dashboard' 
                  : 'Create New Account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {!adminExists 
                ? 'Set up the first admin account to get started' 
                : mode === 'login'
                  ? 'Enter your credentials to access the dashboard'
                  : 'Fill out the form to create a new account'}
            </p>
          </div>
          
          {!adminExists ? (
            <div className="card-container p-6 animate-scale-in">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="input-field pl-10"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="input-field pl-10"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="input-field pl-10"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="input-field pl-10"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                  )}
                </div>
                
                {errors.form && (
                  <div className="bg-destructive/10 p-3 rounded-md flex gap-2 items-start">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{errors.form}</p>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Admin Account...
                    </>
                  ) : (
                    'Create Admin Account'
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="card-container p-6 animate-scale-in">
              <Tabs value={mode} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="input-field pl-10"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="input-field pl-10"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                    </div>
                    
                    {errors.form && (
                      <div className="bg-destructive/10 p-3 rounded-md flex gap-2 items-start">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{errors.form}</p>
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging In...
                        </>
                      ) : (
                        'Log In'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          className="input-field pl-10"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="input-field pl-10"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="input-field pl-10"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="input-field pl-10"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                      )}
                    </div>
                    
                    {errors.form && (
                      <div className="bg-destructive/10 p-3 rounded-md flex gap-2 items-start">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{errors.form}</p>
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
