
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Entry } from '@/lib/types';
import { formatDate, maskPassword } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LogoFetcher from './LogoFetcher';
import { Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import api from '@/lib/api';

interface EntryCardProps {
  entry: Entry;
  onDelete: (id: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };
  
  const handleCopyPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(entry.password);
    toast({
      title: "Password Copied",
      description: "Password has been copied to clipboard",
      duration: 2000,
    });
  };
  
  const handleDelete = async () => {
    if (!entry._id) return;
    setDeleting(true);
    
    try {
      await api.entries.delete(entry._id);
      onDelete(entry._id);
      toast({
        title: "Entry Deleted",
        description: "The entry has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete the entry",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  const formattedWebsite = entry.website.replace(/^https?:\/\//, '');
  
  return (
    <Card className="card-container card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <LogoFetcher 
            website={entry.website} 
            size={40}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium truncate">{entry.name}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                #{entry.serialNumber}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground truncate mt-1">
              {formattedWebsite}
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <span className="font-medium text-sm">{entry.username}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Password</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {showPassword ? entry.password : maskPassword(entry.password)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-border/40 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Added {formatDate(entry.createdAt)}
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a 
              href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/entry/edit/${entry._id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent className="glass-morphism">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this entry? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EntryCard;
