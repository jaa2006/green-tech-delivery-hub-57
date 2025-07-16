
import { useState, useEffect } from "react";
import { LogOut, Loader2 } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Import modular components
import { ProfileAccount } from "@/components/profile/ProfileAccount";
import { PrivacyLocation } from "@/components/profile/PrivacyLocation";
import { ConnectedAccounts } from "@/components/profile/ConnectedAccounts";
import { HelpSupport } from "@/components/profile/HelpSupport";

const Profile = () => {
  const { toast } = useToast();
  const { currentUser, logout, loading } = useAuth();
  const [userData, setUserData] = useState<{ 
    fullName: string; 
    email: string; 
    photoURL?: string; 
    phone?: string; 
  }>({
    fullName: "",
    email: "",
  });
  const [updating, setUpdating] = useState(false);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({ 
            fullName: data.fullName || currentUser.email?.split('@')[0] || "Guest", 
            email: data.email || currentUser.email || "",
            photoURL: data.photoURL || currentUser.photoURL || "",
            phone: data.phone || ""
          });
        } else {
          // If no document exists, use email name as fallback
          setUserData({ 
            fullName: currentUser.email?.split('@')[0] || "Guest",
            email: currentUser.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    };
    
    fetchUserData();
  }, [currentUser, toast]);
  
  // Handle profile update
  const handleUpdateProfile = async (updateData: { fullName: string; photoURL: string; phone: string }) => {
    if (!currentUser) return;
    
    setUpdating(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: new Date(),
      });
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        ...updateData
      }));
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex justify-center items-center h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        <div className="pt-4 px-4 pb-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-white">Profile</h1>
          
          {/* Modular Components */}
          <ProfileAccount 
            userData={userData}
            onUpdateProfile={handleUpdateProfile}
            updating={updating}
          />
          
          <PrivacyLocation />
          
          <ConnectedAccounts />
          
          <HelpSupport />
          
          {/* Logout button */}
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 border-destructive text-destructive hover:bg-destructive/10 rounded-xl py-4"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
