
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Lock, Shield, Database, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
            Secure Credential Management Dashboard
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage all your credentials in one secure place with automatic logo detection and unique username validation.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth?mode=login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card-container p-6 flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Secure Storage</h3>
            <p className="text-muted-foreground">
              All your credentials are securely stored and encrypted for maximum protection.
            </p>
          </div>
          
          <div className="card-container p-6 flex flex-col items-center text-center">
            <Database className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Automatic Serialization</h3>
            <p className="text-muted-foreground">
              Unique serial numbers are automatically assigned to each entry for easy tracking.
            </p>
          </div>
          
          <div className="card-container p-6 flex flex-col items-center text-center">
            <Globe className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Logo Detection</h3>
            <p className="text-muted-foreground">
              Website logos are automatically fetched and displayed for easy visual recognition.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
