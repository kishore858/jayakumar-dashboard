
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
        <div className="card-container max-w-md w-full px-8 py-12 text-center">
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button asChild className="w-full">
            <Link to={user ? "/dashboard" : "/"}>
              <MoveLeft className="mr-2 h-5 w-5" />
              {user ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
