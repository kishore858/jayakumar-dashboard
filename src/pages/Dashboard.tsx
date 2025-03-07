
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import EntryCard from '@/components/EntryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Loader2, 
  X,
  SortAsc,
  SortDesc,
  CalendarIcon,
  Globe,
  KeyRound,
  Hash
} from 'lucide-react';
import { Entry } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortField = 'serialNumber' | 'name' | 'website' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('serialNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
    }
  }, [user, navigate]);
  
  // Fetch entries
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await api.entries.getAll();
        setEntries(data);
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError('Failed to load entries. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchEntries();
    }
  }, [user]);
  
  // Handle entry deletion
  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry._id !== id));
  };
  
  // Filter entries by search term
  const filteredEntries = entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.name.toLowerCase().includes(searchLower) ||
      entry.username.toLowerCase().includes(searchLower) ||
      entry.website.toLowerCase().includes(searchLower) ||
      entry.serialNumber.toString().includes(searchLower)
    );
  });
  
  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'serialNumber':
        comparison = a.serialNumber - b.serialNumber;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'website':
        comparison = a.website.localeCompare(b.website);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Sort options
  const sortOptions = [
    { field: 'serialNumber' as SortField, label: 'Serial Number', icon: Hash },
    { field: 'name' as SortField, label: 'Name', icon: KeyRound },
    { field: 'website' as SortField, label: 'Website', icon: Globe },
    { field: 'createdAt' as SortField, label: 'Date Added', icon: CalendarIcon },
  ];
  
  if (!user) {
    return null; // Will redirect from useEffect
  }
  
  return (
    <Layout>
      <div className="page-container py-8">
        <div className="page-header">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <Button asChild>
            <Link to="/entry/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Link>
          </Button>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                <span className="hidden sm:inline-block">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-morphism">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.field} value={option.field} className="gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Direction</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={sortDirection} 
                onValueChange={(value) => setSortDirection(value as SortDirection)}
              >
                <DropdownMenuRadioItem value="asc" className="gap-2">
                  <SortAsc className="h-4 w-4" />
                  Ascending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc" className="gap-2">
                  <SortDesc className="h-4 w-4" />
                  Descending
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading entries...</p>
          </div>
        ) : error ? (
          <div className="glass-morphism p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="glass-morphism p-8 text-center">
            {searchTerm ? (
              <>
                <p className="text-lg">No entries match your search</p>
                <p className="text-muted-foreground mt-2">
                  Try a different search term or clear the search
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg">No entries found</p>
                <p className="text-muted-foreground mt-2">
                  Add your first credential entry to get started
                </p>
                <Button asChild className="mt-4">
                  <Link to="/entry/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Entry
                  </Link>
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEntries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
